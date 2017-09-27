const invokeLambdaFunction = require('../src/lambda-invoke-function');
const supportedCommands = require('../commands');

function routeMessage(event) {
    
    console.log("route-message function received .... \n", event);
    
  // Command verb not found.
  if (Object.keys(supportedCommands).indexOf(event.command.verb) === -1) {
    return Promise.reject(`Sorry, I don’t know how to respond to “${event.command.verb}.” Things I can do so far: \n \`\`\`screenshot www.website.com\`\`\``);
  }

  const route = supportedCommands[event.command.verb];

  // Check against channel whitelist.
  if (route.channelWhitelist && route.channelWhitelist.indexOf(event.channel_name) === -1) {
    const channels = route.channelWhitelist.map(channel => `#${channel}`).join(', ');
    return Promise.reject(`This command can only be run in the following channels: ${channels}`);
  }

  // Check against user whitelist.
  if (route.userWhitelist && route.userWhitelist.indexOf(event.user_name) === -1) {
    return Promise.reject('You are not authorized to run this command.');
  }

  // Make sure it passes validation before proceeding.
  if (route.validation && !route.validation.test(event.command.predicate)) {
    if (route.usage) {
      return Promise.reject(`Usage: \`${route.usage}\``);
    }

    return Promise.reject('Your message didn’t match the expected format.');
  }

  if (route.type === 'lambda') {
    console.log(`Routing event to ${route.functionName}....\n`, event);
    return invokeLambdaFunction(event, route.functionName);
  }

  return Promise.reject('Sorry, I’m having trouble routing your request.');
}

module.exports = routeMessage;
