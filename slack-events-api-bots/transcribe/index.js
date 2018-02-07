const sendToSlack = require('./src/slack-send-message');
const request = require('request');

exports.handler = function(slackEvent, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.

    if (!slackEvent.command.predicate) {
        sendToSlack(slackEvent, "Something went wrong getting your file. :-( ");
        callback(null);
        return;
    }
    
    /// when all is done
    // this will eventually be a sendToSlack thing
    callback(null, "Your transription is done!");
    return;

};

