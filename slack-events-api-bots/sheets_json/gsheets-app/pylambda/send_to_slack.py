import json
import requests

def send_message(slackEvent, message):
    '''
    Sends message back to the inital user (strings only for now)
    '''
    
    url = slackEvent['response_url']
    
    auth = "Bearer " + slackEvent['authorization']['bot_access_token']
    headers = {'Authorization': auth}
    
    slackMessage = {
        'channel': slackEvent['channel'],
		'token': slackEvent['authorization']['bot_access_token'],
        'text': message
    }
    
    r = requests.post(url, headers=headers, json=slackMessage)
    print ("Sent!")
    print (r)
    return
    
    

    
