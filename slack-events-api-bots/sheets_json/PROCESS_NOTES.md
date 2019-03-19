# Process Notes for sheets_json

This is where I sketch out informal notes for this project as I work.

## Overall Structure

- `Slack`
- Incoming message directed at Quackbot
- `Slack` sends event to:
    - `slack-events-api-message-handler` lambda
        - Sends question to:
            - `dialogflow`
            - Detects gsheets-json intent
            - Sends "fulfillment" webhook to:
                - `file-checker-api`
                - Checks S3 directory identified with user's team
                - According to its contents/existence
                - Returns a Slack message block to dialogflow
            - Returns Slack message block to lambda
        - Returns Slack message back to Slack
    - Displays message block to user
        
        
## Gsheets on Lambda

Trying new approach: https://github.com/nficano/python-lambda

Using virtualenv because that's what I have installed

```
cd [project folder]
virtualenv --python=/usr/bin/python2.7 venv
source venv/bin/activate

mkdir pylambda
pip install python-lambda
cd pylambda
```

`config.yaml` I edited slightly with lambda name and description
`service.py` will be where the app lives.

Testing just the example version for now ...

```
cd pylambda
lambda invoke -v
```

And

```
lambda deploy
```

Also made sure the lambda function name here is the same as the `commands.js` name.

## Dialogflow

Need to write up what I did here, with the API going out to the File Checker API.

Also the "Action" needs to match a command in `commands.js`


## File Checker API

This is the lambda function that will receive a "fulfillment" webhook from Dialogflow. It quickly returns a Slack block message to return to the user.

### Dialogflow Webhook definitions

Following the V1 API [instructions here](https://dialogflow.com/docs/fulfillment/how-it-works).

### Claudia

Edited `package.json` so the lambda function name is more reflective of the function: `"name": "quackbot-sheets-json-file-checker-api",`

Initial command:

```
./node_modules/.bin/claudia create --region us-east-1 --api-module lambda --role lambda_basic_execution
```

Subsequent updates

```
./node_modules/.bin/claudia update
```

### Lambda URL

It's `https://brb05rxoya.execute-api.us-east-1.amazonaws.com/latest/checkfiles`

## Slack Blocks Builder

[Builder tool is here](https://api.slack.com/tools/block-kit-builder).

Note that the `action_id` here ...

```
"accessory": {
    "action_id": "gsheet_json",
```

Needs to match an item in the `commands.js` file in `slack-events-api-message-handler/`    

### AWS

Had to add the sheets-json lambda function to the `quackbot-slack-events-api-router-executor` role at https://console.aws.amazon.com/iam/home#/roles/quackbot-slack-events-api-router-executor?section=permissions

Here's how to move the latest to prod:

```
aws lambda create-alias --function-name quackbot-sheets-json-bot --name prod --function-version "\$LATEST"
```

Change the function-version to a number like `function-version 42` to assign a specific version to prod.

## TODO:

- encrypt team ids just for good practice
- add authorization token to the API
- detect message type: `"type": "block_actions"` and funnel that directly to gsheet-to-json
- Make sure whole app is using the signing secret method now: https://api.slack.com/docs/verifying-requests-from-slack



