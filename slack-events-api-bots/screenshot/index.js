const config = require('./config');
const lambdaChrome = require('lambda-chrome');
const captureScreenshot = require('./src/capture-screenshot');
const sendToSlack = require('./src/slack-send-message');

function generateReply(s3Response, slackEvent) {
    return {
        attachments: [
            {
                "text": "Ding! Your screenshot is ready. Enjoy.",
                "fallback": "Here's your generated screenshot",
                "image_url": `http://${config.s3.bucket}.s3-website-us-east-1.amazonaws.com/${s3Response.key}`,
                "footer": `Taken from ${slackEvent.command.predicate}`,
            },
        ],
    };
}

exports.handler = function (slackEvent, context, callback) {
    console.log('Received Slack event....', slackEvent);

    if (!slackEvent.command.predicate) {
        callback(new Error('No screenshot URL provided'));
        return;
    }

    // slack links can arrive like this <http://nyc.gov> 
    // or this <http://nyc.gov|nyc.gov> ... so pulling out 
    // the core link in either case:
    const url = slackEvent.command.predicate.replace(/^</, '').replace(/>$/, '').replace(/\|.*$/, '');
 
    sendToSlack(slackEvent, "One screenshot coming right up! This may take a minute ...");
    
    lambdaChrome()
    .then(client => captureScreenshot(client, url))
    .then(s3Response => {
        console.log('Generated screenshot....', s3Response);
        return sendToSlack(slackEvent, generateReply(s3Response, slackEvent));
    })
    .then(() => {
        callback(null, 'Responded to Slack.');
    })
    .catch(err => {
        console.error(err);
        callback(new Error('Could not generate screenshot.'));
    });
};
