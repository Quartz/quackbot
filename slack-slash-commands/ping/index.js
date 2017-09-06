// This function generates a reply for Slack. The response type can be
// "in_channel" (visible to all users) or "ephemeral" (only visible to the user
// who sent the command).
function generateReply(slackMessage) {
  return {
    response_type: 'in_channel',
    text: `pong ${slackMessage.command.predicate}`,
  };
}

exports.handler = (lambdaEvent, context, callback) => {
  const reply = generateReply(lambdaEvent);
  console.log('Generating reply....', reply);

  // We pass our reply to the callback function.
  callback(null, reply);
};
