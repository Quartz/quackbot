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


## TODO:

- encrypt team ids just for good practice
- add authorization token to the API
- detect message type: `"type": "block_actions"` and funnel that directly to gsheet-to-json



