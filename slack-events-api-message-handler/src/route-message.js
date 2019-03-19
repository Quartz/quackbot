const invokeLambdaFunction = require('../src/lambda-invoke-function');

function routeMessage(event) {
 
    const supportedCommands = require('../commands');
    
    console.log("Routing this event:", JSON.stringify(event))
    
    // If the command verb not found (this will include smalltalk... actions from the nlp)
    // then just end quietly.
    if (Object.keys(supportedCommands).indexOf(event.command.verb) === -1) {
        console.log(`Action/verb "${event.command.verb}" not in the command.js list. Silently halting route to another lambda.`);
        return Promise.resolve();
    }
  
    // If we're in the middle of a conversation (event.nlp.results.actionIncomplete = true),
    // then we don't yet have enough information, so just end quietly. TODO: Update for Dialogflow V2
    if (event.hasOwnProperty("nlp") && event.nlp.hasOwnProperty("actionIncomplete") && event.nlp.actionIncomplete === true) {
        console.log(`We don't have all the info yet [actionIncomplete === true]. Silently halting route to another lambda.`);
        return Promise.resolve();
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
