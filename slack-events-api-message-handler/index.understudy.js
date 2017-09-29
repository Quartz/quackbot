var Sequelize = require('sequelize');
var db        = require('./lib/models/db')(Sequelize);

var responder = function(event, context, callback){
    db.team.findOne({ where: { slack_id: event.team_id } })
    .then( team => {
        if (team === null) {
            // bail.  We somehow got a message from a team
            // that didn't install the bot.
        } else {
            var authorization = team.authorization();
            
            var bot_details      = authorization.details.bot;
            var bot_access_token = bot_details.bot_access_token;
            var bot_user_id      = bot_details.bot_user_id;
            
            // Tell the team they're not cool enough.
            if (!team.verified) {
                console.log('Team not yet validated by DocumentCloud. Informing user ...');
                var message = "I'm still waiting for the folks at DocumentCloud to say you can use my services!";
                //return sendToSlack(event, message);
            } else {
                // add the authorization info to the event
                console.log('Team Verified, handling message');
                event.authorization = authorization;
                //return respondToSlackMessage( event, context, callback);
            }
        }
    })
    .then(message => {
        console.log(message);
        callback(null);
    })
    .catch(error => {
        console.error(error.message);
        callback(error);
    });
};

//var respondToSlackMessage = function(event, context, callback) {
//
//    // Extract command words.
//    const commandWords = event.text.trim().split(/\s+/);
//
//    // To reach the bot, it must be a DM (in a "D" channel)
//    // or an @-mention at the start of a line.
//
//    var is_direct_message_to_me = event.channel.match(/^D*/)[0] == "D";
//    var command_starts_with_me = (commandWords[0] == `<@${event.authorization.bot_user_id}>`);
//
//    if (!is_direct_message_to_me && !command_starts_with_me) {
//        return 'Ignoring message that is none of my beeswax, bye!';
//    }
//
//    if (command_starts_with_me) {
//        event.command = {
//            verb: commandWords[1].toLowerCase(),
//            predicate: commandWords.splice(2).join(' '),
//        };
//    } else {
//        event.command = {
//            verb: commandWords[0].toLowerCase(),
//            predicate: commandWords.splice(1).join(' '),
//        };
//    }
//
//    console.log(`Event posted to ${event.stage} stage with verb '${event.command.verb}' and predicate '${event.command.predicate}'.`);
//
//    return routeMessage(event).catch((message) => respondOnError(event, message) );
//};
