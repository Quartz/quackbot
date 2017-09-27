# Process Notes for botstudio-search-sheet

Here's where I keep the notes I take as I build.

## Concept

Idea is to use Slack to search the information in [this spreadsheet](https://docs.google.com/spreadsheets/d/1hU7Snj4KZ-ppyy388l-sV4I26n4yGVb8xYnygPOS-5k/edit#gid=0). Or any spreadsheet.

So in Slack: `/quack search-data agriculture`

Should return some possibilities to pursue.

Maybe the settings are:

- url of spreadsheet to search
- name of the sheet
- columns to search
- columns to reply with
- format of reply?

## Setup

Going to have this run as an AWS lambda function, so starting with my base lambda setup here: 
https://github.com/jkeefe/basic-lambda-setup


## Search

Really excited to try [fuzzywuzzy](https://github.com/seatgeek/fuzzywuzzy) from SeatGeek. Or, really, the [Javacript port](https://github.com/nol13/fuzzball.js) of it.

```
npm init --yes
npm install fuzzball --save
```

Also once again using the lovely [tabletopjs](https://github.com/jsoma/tabletop). 

```
npm install tabletop --save
```

## Put up on lambda

Install claudia.js:

```
npm install claudia --save-dev
```


Create the lambda function.

```
./node_modules/.bin/claudia create --region us-east-1 --handler index.handler --role lambda_basic_execution
```

Updating the lambda function:

```
./node_modules/.bin/claudia update
```

## Fielding queries from Quack bot

Need to do the following:

- add the file `lib/slack-reply-to-slash-command.js` to the project
- add this line to `index.js`:

`var replyToSlack = require('./lib/slack-reply-to-slash-command');`

- in `index.js` replace the final callback with this:

```
replyToSlack(event, reply);
callback(null, {} );
```

