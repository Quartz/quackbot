# Slack Events to AWS Lambda

This repo provides a Slack Events API endpoint on AWS API Gateway and Lambda
to process Slack events. It parses the response and either invokes another
Lambda function or responds to let the user know that something went wrong.

## Creating and updating the endpoint

```
claudia create --api-module index --region us-east-1
```

[Claudia][claudia] will print out the endpoint base URL. Append `/messages` to
the end and provide it to Slack in the "Events" section of your app
configuration.

Update the endpoint with:

```
claudia update
```

## Add a verification token as stage variable

In the AWS web console, select your endpoint, select the stage, open the "Stage
Variables" tab, and add a variable named `slackAppVerificationToken`. The value
should be your app's verification token, which can be found on the "Basic
Information" page of your app's settings.

Or run the following AWS CLI command (using the `jq` utility to extract the API
Gateway ID):

```
aws apigateway create-deployment \
--rest-api-id $(jq -r '.api.id' claudia.json) \
--stage-name latest \
--variables slackAppVerificationToken=mytoken
```

## Enabling commands

This endpoint expects to receive messages in a specific format:

```
command verb predicate which can be zero or more words
```

Add your verb to `commands.js`.

## That's it?

That's it. But now you can write any number of Lambda functions or other code
to respond to these commands.

## Using API Gateway stages

One way to manage testing—for both this router and the Lambda functions it
calls—is to create different "stages" on a single API Gateway endpoint and
provide them to two different Slack teams: a "testing" Slack team and a "prod"
Slack team. This allows you to avoid multiple separate deployments of your
Lambda functions.

When you initially created your endpoint, your one and only stage is named
"latest" (the default). Notice that the stage name is included in the endpoint
URL. Provide this endpoint to a "testing" Slack team. This is your dev tier.

Create a new stage named "prod":

```
claudia set-version --version prod
```

This is your prod tier, which will invoke the "prod" qualifier / alias of your
router Lambda function (which the above command also created). You also must
provide the verification token from your "prod" Slack team as a stage variable,
as outlined in the section "Add a verification token as stage variable" above
(the token is different for each Slack team).

Using `claudia set-version`, you will also need to create the "prod" alias for
each Lambda function you wish to invoke via the router. The pattern will be
consistent: The "latest" stage of the API Gateway invokes the "latest" version
of the router function, which invokes the "latest" version command functions.
Similarly, the "prod" stage invokes the "prod" versions of the router and
command functions. This allows you to run bleeding-edge code in your "testing"
Slack team and reliable code in your "prod" Slack team.

Use the same flow for updating *both the router and command functions*:

1. Update your code.

2. Run `claudia update`, which automatically updates the "latest" alias.

3. Test in your "testing" Slack.

4. Run `claudia set-version --version prod` to update the "prod" alias.

[app-config]: https://api.slack.com/slack-apps
[claudia]: https://claudiajs.com

## Repo Note

Note that while this directory is called `slack-events-api-gateway` -- which is an accurate description -- the lambda function it represents is still called `slack-events-api-router`, which is not what it does anymore.


