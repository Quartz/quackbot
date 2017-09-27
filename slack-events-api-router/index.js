const respondOnError = require('../src/respond-on-error');
const routeMessage = require('../src/route-message');
const sendToSlack = require('../src/slack-send-message');
const validateTeam = require('../src/validate-team');

const botName = 'quackbot';
const botUserID = '<@U75V2FNET>';
const supportedEventTypes = [
    'message',
    'message.channels',
];

exports.handler = (event, context, callback) => {
    validateTeam(event).then(validation => {
        
        // add the authrization info to the event
        event.authorization = validation;
        
        // Extract command words.
        const commandWords = event.text.trim().split(/\s+/);

        event.command = {
            subject: commandWords[0],
            predicate: commandWords.splice(2).join(' '),
            verb: commandWords[1],
        };
        
        // To reach the bot, it must be a DM (in a "D" channel)
        // or an @-mention at the start of a line.
        if (event.channel.match(/^D*/)[0] !== "D" && commandWords[0] !== `<@${event.authorization.bot_user_id}>`) {
            return 'Ignoring message that is none of my beeswax, bye!';
        }

        if (!validation.cleared) {
            console.log('Team not yet validated by DocumentCloud. Informing user ...');
            var message = "I'm still waiting for the folks at DocumentCloud to say you can use my services!";
            return sendToSlack(event, message);
        } 

        console.log(`Event posted to ${event.stage} stage.`);

        return routeMessage(event).catch(respondOnError);

    }); 
    })
    .then(message => {
      console.log(message);
      callback(null);
    })
    .catch(error => {
    // We should *still* respond to Slack with 200, we'll just log it.
      console.error(error.message);
      callback(error);
    });
}
