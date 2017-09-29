const https = require('https');
const qs = require('querystring');

// This function requires the original event since replying in the same channel
// is the only supported flow.
function handleSharedFile(slackEvent) {
    return new Promise ((resolve, reject) => {
        
        console.log("Handling this file data:", slackEvent);

        // const fileData = {
        //     token: slackEvent.authorization.bot_access_token,
        //     file: slackEvent.file.,
        //     text: reply,
        // };
        // const requestUrl = `https://slack.com/api/chat.postMessage?${qs.stringify(slackMessage)}`;
        // 
        // console.log("Prepared to send this to slack: ", requestUrl);
        // 
        // // Send message.
        // https.get(requestUrl, (res) => {
        //     resolve(`OK: responded, slack gave ${res.statusCode}`);
        // }).on('error', (err) => {
        //     reject(`ERROR: responded, but slack gave ${err.message}`);
        //     
        // });
            
    });
}

module.exports = handleSharedFile;
