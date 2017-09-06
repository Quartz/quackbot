const supportedCommands = require('../commands');

function processMessage(message) {
  // Extract command.
  const commandWords = message.text.split(/\s+/);

  // This object will be added to the message so that invoked functions don't
  // have to parse the command themselves.
  const command = {
    subject: message.command.replace(/^\//, '').replace(/\s+/, ''),
    predicate: commandWords.splice(1).join(' '),
    verb: commandWords[0],
  };

  // Command verb not found.
  if (Object.keys(supportedCommands).indexOf(command.verb) === -1) {
    throw new Error(`Sorry, I don’t know how to respond to “${command.verb}.”`);
  }

  const route = supportedCommands[command.verb];

  // Check against channel whitelist.
  if (route.channelWhitelist && route.channelWhitelist.indexOf(message.channel_name) === -1) {
    const channels = route.channelWhitelist.map(channel => `#${channel}`).join(', ');
    throw new Error(`This command can only be run in the following channels: ${channels}`);
  }

  // Check against user whitelist.
  if (route.userWhitelist && route.userWhitelist.indexOf(message.user_name) === -1) {
    throw new Error('You are not authorized to run this command.');
  }

  // Command verb found, but it should be used with a different slash command.
  if (route.botName !== command.subject) {
    throw new Error(`You might want to ask \`/${route.botName}\` about that!`);
  }

  // Make sure it passes validation before proceeding.
  if (route.validation && !route.validation.test(command.predicate)) {
    if (route.usage) {
      throw new Error(`Usage: \`/${route.botName} ${command.verb} ${route.usage}\``);
    }

    throw new Error('Your message didn’t match the expected format.');
  }

  // Add command words to the message to form final message. Delete token out of
  // pure paranoia.
  const processedMessage = Object.assign(message, { command });
  delete processedMessage.token;

  return processedMessage;
}

module.exports = processMessage;
