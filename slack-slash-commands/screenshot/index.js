const config = require('./config');
const lambdaChrome = require('lambda-chrome');
const captureScreenshot = require('./src/capture-screenshot');
const replyToSlashCommand = require('./src/slack-reply-to-slash-command');

function generateReply(s3Response, slackMessage) {
  return {
    response_type: 'in_channel',
    attachments: [
        {
            fallback: 'Generated screenshot',
            image_url: `${config.s3.cloudfront}/${s3Response.key}`,
            footer: `Generated screenshot of ${slackMessage.command.predicate}`,
        },
    ],
  };
}

exports.handler = function (slackMessage, context, callback) {
  console.log('Received Slack message....', slackMessage);

  if (!slackMessage.command.predicate) {
    callback(new Error('No screenshot URL provided'));
    return;
  }

  const url = slackMessage.command.predicate.replace(/^</, '').replace(/>$/, '');

  lambdaChrome()
    .then(client => captureScreenshot(client, url))
    .then(s3Response => {
      console.log('Generated screenshot....', s3Response);
      return replyToSlashCommand(slackMessage, generateReply(s3Response, slackMessage));
    })
    .then(() => {
      callback(null, 'Responded to Slack.');
    })
    .catch(err => {
      console.error(err);
      callback(new Error('Could not generate screenshot.'));
    });
};
