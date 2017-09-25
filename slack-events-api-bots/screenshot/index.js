const config = require('./config');
const lambdaChrome = require('lambda-chrome');
const captureScreenshot = require('./src/capture-screenshot');
const sendToSlack = require('./src/send-to-slack');

function generateReply(s3Response, slackEvent) {
  return {
    response_type: 'in_channel',
    attachments: [
        {
            fallback: 'Generated screenshot',
            image_url: `https://${config.s3.bucket}.s3-website-us-east-1.amazonaws.com/${s3Response.key}`,
            footer: `Generated screenshot of ${slackEvent.command.predicate}`,
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

  const url = slackEvent.command.predicate.replace(/^</, '').replace(/>$/, '');

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
