# oAuth Dancer

This is a lambda function that's designed to catch an authorization callback 
from Slack.  It'll respond to the request from Slack and initiate further 
calls to generate and validate authorization tokens.

## requirements

* ✅ receive approval GET request from Slack w/ `code` and `state` parameters
* ✅ [Initiate a request to slack for an access token](https://api.slack.com/docs/oauth#step_2_-_token_issuing)
* Store the results of the authorization for later use.