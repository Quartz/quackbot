const getSnsMessage = require('./src/lambda-get-sns-message');
const replyToSlashCommand = require('./src/slack-reply-to-slash-command');

// This function generates a reply for Slack.
function generateReply(slackMessage) {
  return {
    response_type: 'ephemeral',
    text: `<@${slackMessage.user_name}> pong ${slackMessage.command.predicate}`,
  };
}

exports.handler = (lambdaEvent, context, callback) => {
  const slackMessage = getSnsMessage(lambdaEvent);
  const reply = generateReply(slackMessage);

  // The callback parameter is how we let AWS Lambda know that we are done
  // processing.
  replyToSlashCommand(slackMessage, reply).then(callback).catch(callback);
};
