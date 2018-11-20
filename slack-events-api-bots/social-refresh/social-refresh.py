import os
import json
from urllib2 import urlopen
import requests

TOKEN = os.environ.get("FACEBOOK_TOKEN")
# how I'm originally grabbing the URL is based on a text field in Slack

# message is the current slack-based payload sent from place to place... this is currently how the message gets handled
command = "scrape <https://www.newsday.com/long-island/nassau/great-neck-library-board-trustee-mimi-hu-1.22690319>"

def handler(event, context):

    try:
        url = event.command.predicate ## note URL validation happens upstream
        ### new Facebook graph API
        r = requests.post('https://graph.facebook.com/v3.2/', params={'scrape':'true', 'id': url, 'access_token': TOKEN})
        # print in console to make sure everything works
        print r.text
        print r.status_code
        try:
            message = "*Your page is fully scraped for Facebook/Twitter!*\n*Link*: `" + url + "`\n*Title*: " + str(json.loads(r.text)['title'].encode('utf-8').strip()) + "\n*Description*: " + str(json.loads(r.text)['description'].encode('utf-8').strip()) + "\n*Photo*: " + str(json.loads(r.text)['image'][0]['url'])
        except Exception as e:
            if int(r.status_code) == 200:
                message = "*Your page is fully scraped for Facebook/Twitter!*\n*Link*: `" + url + "`\nSince this is a shortened URL, I can't show you everything that was scraped."
            else:
                message = "This did not scrape properly."
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
