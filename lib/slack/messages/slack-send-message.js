const https = require('https');
const qs = require('querystring');

// This function requires the original event since replying in the same channel
// is the only supported flow. Message can either be a simple string or a 
// JSON object with or without attachments.
function sendToSlack(slackEvent, reply) {
        
    if (!reply) {
        console.log ('OK: nothing to say');
        return;
    }
    
    console.log("Handling this event for sending back:", slackEvent);

    const slackMessage = {
        token: slackEvent.authorization.bot_access_token,
        channel: slackEvent.channel,
    };
    
    // attachments must be URL encoded json
    if (reply.hasOwnProperty("attachments")) {
        slackMessage.attachments = JSON.stringify(reply.attachments);
    }
    
    if (reply.hasOwnProperty("text")) {
        slackMessage.text = reply.text;
    }
    
    if (typeof reply == 'string') {
        slackMessage.text = reply;
    }
    
    const requestUrl = `https://slack.com/api/chat.postMessage?${qs.stringify(slackMessage)}`;

    console.log("Prepared to send this to slack: ", requestUrl);

    // Send message.
    https.get(requestUrl, (res) => {
        console.log (`OK: responded, slack gave ${res.statusCode}`);
        return;
    }).on('error', (err) => {
        console.log (`ERROR: responded, but slack gave ${err.message}`);
        return;
    });    

}

module.exports = sendToSlack;
