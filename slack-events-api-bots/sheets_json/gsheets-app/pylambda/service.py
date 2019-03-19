# -*- coding: utf-8 -*-
from send_to_slack import send_message

def handler(event, context):
    # Your code goes here!
    
    send_message(event, "Woot! We're ready to make real JSON.")
    
    print ("Lambda function works!") 
    return "OK"
