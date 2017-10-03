const https = require('https');
const qs = require('querystring');

// This function requires the original event since replying in the same channel
// is the only supported flow.
function sendToSlack(slackEvent, reply) {
    return new Promise ((resolve, reject) => {
        
        if (!reply) {
            reject('OK: nothing to say');
        }

        const slackMessage = {
            token: slackEvent.authorization.bot_access_token,
            channel: slackEvent.channel,
            text: reply,
        };
        const requestUrl = `https://slack.com/api/chat.postMessage?${qs.stringify(slackMessage)}`;

        // Send message.
        https.get(requestUrl, (res) => {
            resolve(`OK: responded, slack gave ${res.statusCode}`);
        }).on('error', (err) => {
            reject(`ERROR: responded, but slack gave ${err.message}`);
            
        });    
    });
}

module.exports = sendToSlack;
