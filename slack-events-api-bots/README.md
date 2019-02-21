# Quackbot's Bots

Quackbot is really a bot of bots -- a single, friendly interface to a bunch of tools for journalists.

This directory is where we keep the bots.

## Generally

In general, Quackbot's sub-bots:

- Exist as their own lambda functions on AWS.
- Are deployed to AWS using `claudia.js` (at least that's what we do)
- Contain their own data, node packages and utility functions
- Receive the full Slack event for the message Quackbot got, along with some fields we've added along the way, including `event.command.predicate`, which contains information from the user that the bot will act upon -- like a url or a search topic.
- Will be invoked by the router in `slack-events-api-message-handler`.

## Steps to set up

These steps are what we follow, and some require AWS rights you probably don't have. Just get in touch if you'd like to add a bot!

### Prep the code

- Make a new directory here, usually named for the verb/action used to invoke it
- Include an `index.js` file
- The bot's functionality is within a `index.js` function that looks like this:

    ```
    exports.handler = function(event, context, callback){
        // bot stuff here
    }
    ```

### Make Lambda function using Claudia

- Install Claudia using `npm install claudia --dev-save`
- Make sure all the other packages are installed with `npm install`
- In AWS, go to IAM Roles and make a separate lambda-executor role for the bot:
    - Service: Lambda
    - Permissions: log-writer (a customer-managed policy)
    - Name it like `quackbot-cliches-executor`
- Now create the lambda function with claudia like this (replacing `cliches` with the sub-bot's name):
```
claudia create --region us-east-1 --handler index.handler --name quackbot-cliches --role quackbot-cliches-executor
```
- Note that if the bot is big, you may have to side-load it from an AWS bucket with `--use-s3-bucket [bucket_name]`
- Commit the code to the `quackbot` repo

### Wire it to Quackbot

- Edit `slack-events-api-message-handler/commands.js` to add to Quackbot's abilities. Note that the property label used ahead of the data must match the "action" supplied by the natural language processor. So here, it's `cliches`.
    ```
    cliches: {
        type: 'lambda',
        functionName: 'quackbot-cliches',
        usage: 'Look for cliches on <url>',
        descrition: 'Scan a web page for cliches.'
    }
    ```
- Back at AWS under IAM Policies, add the bot's ARN as a "Resource" in the IAM policy called `quackbot-invoke-all-subbots`
- Update the `slack-events-api-message-handler` using `claudia update`

### Prepare the Natural Language Processor

- Train our [Dialogflow](http://dialogflow.com) agent to send the bot's name as an ACTION and any additional parameters given a user's natural language input. So "please send me a screenshot of https://qz.com" becomes a "screenshot" action with "https://qz.com" as the url parameter. Note that the action must match the bot's property label in `slack-events-api-message-handler/commands.js`. (See example above using `cliches`.)
- If the parameter provided by API.ai isn't "url" or "topic" you need to add the new type as a possible `event.command.predicate` in the code at `slack-events-api-message-handler/index.js` (TODO: Abstract this.)

### Test and deploy

- Test in our test Slack account
- Check the logs
- Try again
- Check the logs
- Fix that thing
- Check the logs
- Deploy by pushing both the bot's lambda function and `slack-events-api-message-handler` to `prod` using `claudia set-version --version prod`


