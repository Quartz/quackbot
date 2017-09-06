const invokeLambdaFunction = require('../src/lambda-invoke-function');
const publishSnsMessage = require('../src/sns-publish-message');
const supportedCommands = require('../commands');

function routeMessage(message) {
  // This object describes what we should do with the command.
  const commandRoute = supportedCommands[message.command.verb];

  if (commandRoute.type === 'lambda') {
    return invokeLambdaFunction(message, commandRoute.functionName, !!commandRoute.reply)
      .then(response => commandRoute.reply || response);
  }

  if (commandRoute.type === 'sns') {
    return publishSnsMessage(message, commandRoute.topicArn).then(() => commandRoute.reply || null);
  }

  throw new Error('Sorry, I’m having trouble routing your request.');
}

module.exports = routeMessage;
