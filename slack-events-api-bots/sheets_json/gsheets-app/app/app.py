import json

from gsheet_to_json import update_json_data

def lambda_handler(event, context):
    
    spreadsheet_url = event[something][something]
    target_filename = event[something][filename]
    
    try:
        update_json_data(spreadsheet_url, target_filename)
    except:
        # Send some context about this error to Lambda Logs
        print "Something happened in the gsheet-to-json program."

    return {
        "statusCode": 200,
        "body": json.dumps(
            {"message": "hello world", "location": ip.text.replace("\n", "")}
        ),
    }
