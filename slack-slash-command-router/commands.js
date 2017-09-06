// For SNS delivery, use the following format.
// {
//   type: 'sns',
//   topicArn: 'arn:aws:sns:us-east-1:account:topic',
// }

module.exports = {
  kudos: {
    type: 'lambda',
    botName: 'qzbot',
    functionName: 'slack-slash-command-qzbot-kudos',
  },
  ping: {
    type: 'lambda',
    botName: 'qzbot',
    functionName: 'slack-slash-command-qzbot-ping',
  },
  screenshot: {
    type: 'lambda',
    botName: 'qzbot',
    functionName: 'slack-slash-command-qzbot-screenshot',
    reply: {
      response_type: 'in_channel',
      text: ':frame_with_picture: Generating your screenshot....',
    },
  },
  cliches: {
    type: 'lambda',
    botName: 'quack',
    functionName: 'botstudio-cliche-finder',
    reply: {
      response_type: 'in_channel',
      text: 'Checking that website....',
    },
  },
};
