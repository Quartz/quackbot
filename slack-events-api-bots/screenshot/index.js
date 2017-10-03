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
        // missing URLs actually handled upstream by API.ai
        // sendToSlack(slackEvent, "Oh, you have to specify a website. Try `@quackbot screenshot example.com`");
        callback(null);
        return;
    }

    const url = slackEvent.command.predicate;
     
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
        sendToSlack(slackEvent, "Hmmm. Something went awry there.");
        callback(null);
    });
};
