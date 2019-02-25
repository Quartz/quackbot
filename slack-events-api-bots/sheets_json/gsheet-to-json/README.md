# Google Sheet data to JSON

A Quackbot script that gives users a Slack command to easily send data from a Google Sheet into a JSON file on S3 suitable for use in web apps.

## Basic architecture

* **Google Sheets:** Users create and maintain their own Google Sheets to store and edit their data.
* **Storage backend TBD:** Not sure where this ends up, but Quackbot listens for an "add project" command, then collects and stores some basic per-project information: Google Sheet URL, project name, destination filename for the JSON.
* **AWS Lambda:** Quackbot listens for the "create json" command, determines which project the user is requesting data for, then triggers a Lambda function that wraps the `gsheet_to_json.py` script.
* **S3:** JSON files created by `gsheet_to_json.py` are stored in an S3 bucket that we maintain.

## Things users will need to do for each Google Sheet

1) Register a project entry with Quackbot, giving us the sheet URL and a name they want to use to reference it later
2) Share access to that sheet with our Google API email address (we'll need to create an auth account for this, and should remind the user to share with the address each time they add a sheet)

## Basic flow of `gsheet_to_json.py`

The Lambda function should pass two variables into `gsheet_to_json.py`:

* the Google Sheet URL
* the destination filename for the JSON

From there, the script:

1) Authenticates with the Google Spreadsheets API, using our Google API email address.
2) Opens the Google Sheet URL. (If the user hasn't shared that sheet with our Google API email address, this will fail.)
3) Gets the data from the first worksheet there. (We'll need to let users know that we ONLY get data from the first sheet.)
4) Does a quick transform on the data, making sure everything's a string.
5) Uses our IAM credentials to authenticate with S3.
6) Writes a JSON file in memory, and then stores it in our S3 bucket.

## Things we need to do

* create a Google API Project with access to the Spreadsheet API and an associated project email address and private key (instructions here are a bit out-of-date, but close: https://gspread.readthedocs.io/en/latest/oauth2.html)
* create an S3 bucket where we want to store all the JSON files
* create an AWS IAM user with access to that S3 bucket
* figure out the storage system for per-project details (Google Sheet URL, project name, JSON filename)

## User workflows we need to create

### User adds a new Google Sheet to Quackbot

1) Quackbot listens for something like "add Google Sheet for JSON"
2) Quackbot asks user for the Google Sheet URL
- we validate the URL
- we check to see if they've already added that URL
3) Quackbot asks user what nickname they'd like to give this new project
- we make sure they haven't used that name for another project
- would be even better to use the spreadsheet's title as the nickname if possible(!)
4) INVISIBLE TO USER: Quackbot adds project metadata in our storage system, using lowercase/slugified project nickname as the key. Data stored is: user, Google Sheet URL, project nickname, JSON filename (which we should automatically generate using some combination of nickname+GUID)
5) Quackbot gives the user a success message, provides our API email address, and reminds them they must give that address access to their Google Sheet for this to work

-----
Alternate version, without using a database:

    Human: Turn my spreadsheet into JSON.

    - incoming-messages lambda function checks team directory to see if there are any current files
    - If current files exist ...
        - Provides a dropdown of spreadsheet names
        - Provides "new spreadsheet" button
    - Otherwise
        - Tells human to share the spreadsheet

    Quackbot: OK, be sure it has no private data inside (because we’re about to put it on the internet!) and then share that me with quackbot@gmail.com. When you’re done, click the Done button.

    Human: Clicks Done button.
    
        - Payload of Done button routes back to the incoming-messages lambda. 

    Quackbot: What’s the URL?

    Human: https://docs.google.com/spreadsheets/d/1aRfM0CPO36_HnzSE7XPKn6Xh9aFvCuwNJ-glv0I-Lnw/edit?usp=sharing

    Lambda:
    - Hits the spreadsheet URL to make sure it's being shared right
    - Passes URL to `gsheet_to_json`
    - Which makes the JSON *and* detects the spreadsheet title is “My Example Project”
    - Stores json file on S3 as `/[slackTeamIDNumber]/My%20Example%20Project.json`
    - Stores another file called `/[slackTeamIDNumber]/My%20Example%20Project.txt` containing the URL of the google spreadsheet, encrypted.

later, when we need to list the available spreadsheets, we just check the files in the team directory, and list them!

### User asks for new JSON from a project

1) Quackbot listens for something like "make JSON (for X)"
2) Quackbot determines which project they're talking about
- if the user does NOT provide a project nickname, we return a list of the Google Sheet projects they've added so far, with each project as a clickable button. The user clicks a button in response.
- if they DO provide a project nickname, we attempt to find its metadata in our storage system. If we can't find it, we return the list of existing Google Sheet projects as above and the user clicks a button in response.
3) INVISIBLE TO USER: Quackbot passes project metadata into the Lambda wrapper around `gsheet_to_json.py`, which creates and stores the JSON in S3.
4) Quackbot returns a success message along with a reminder link to the JSON file.

