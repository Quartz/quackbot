import json
import os
import json
from urllib2 import urlopen
import requests

TOKEN = os.environ.get("FACEBOOK_TOKEN")

def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        {
            "resource": "Resource path",
            "path": "Path parameter",
            "httpMethod": "Incoming request's method name"
            "headers": {Incoming request headers}
            "queryStringParameters": {query string parameters }
            "pathParameters":  {path parameters}
            "stageVariables": {Applicable stage variables}
            "requestContext": {Request context, including authorizer-returned key-value pairs}
            "body": "A JSON string of the request payload."
            "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encode"
        }

        https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

    Attributes
    ----------

    context.aws_request_id: str
         Lambda request ID
    context.client_context: object
         Additional context when invoked through AWS Mobile SDK
    context.function_name: str
         Lambda function name
    context.function_version: str
         Function version identifier
    context.get_remaining_time_in_millis: function
         Time in milliseconds before function times out
    context.identity:
         Cognito identity provider context when invoked through AWS Mobile SDK
    context.invoked_function_arn: str
         Function ARN
    context.log_group_name: str
         Cloudwatch Log group name
    context.log_stream_name: str
         Cloudwatch Log stream name
    context.memory_limit_in_mb: int
        Function memory

        https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict
        'statusCode' and 'body' are required

        {
            "isBase64Encoded": true | false,
            "statusCode": httpStatusCode,
            "headers": {"headerName": "headerValue", ...},
            "body": "..."
        }

        # api-gateway-simple-proxy-for-lambda-output-format
        https: // docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """

    try:
        url = event['command']['predicate'] ## note URL validation happens upstream        ### new Facebook graph API
        r = requests.post('https://graph.facebook.com/v3.2/', params={'scrape':'true', 'id': url, 'access_token': TOKEN})
        # print in console to make sure everything works
        print r.text
        print r.status_code
        try:
            message = "*Your page is fully scraped for Facebook/Twitter!*\n*Link*: `" + url + "`\n*Title*: " + str(json.loads(r.text)['title'].encode('utf-8').strip()) + "\n*Description*: " + str(json.loads(r.text)['description'].encode('utf-8').strip()) + "\n*Photo*: " + str(json.loads(r.text)['image'][0]['url'])
        except Exception as e:
            if int(r.status_code) == 200:
                message = "*Your page is fully scraped for Facebook/Twitter!*\n*Link*: `" + url + "`\nSince this is a shortened URL, I can't show you everything that was scraped."
            elif int(r.status_code) == 400:
                message = "Your scrape has an error ```" + str(json.loads(r.text)['error']['error_user_msg'].encode('utf-8').strip()) + "```\nContact your development team to fix this."
            else:
                message = "This did not scrape properly and the tags to debug cannot be found."
    except Exception as e:
        print e
        message = "Sorry, this broke, contact support... bahahahaa."

    # Here we need to use both `event` and `message`
    # post back to the Slack user.
    # It'll need to be a python port of ./src/slack-send-message
    print message

    return {
        'status' : 'OK'
    }


