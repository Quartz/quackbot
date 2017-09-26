const respondOnError = require('../src/respond-on-error');
const routeMessage = require('../src/route-message');
const sendToSlack = require('../src/slack-send-message');
const validateTeam = require('../src/validate-team');

const botName = 'quackbot';
const supportedEventTypes = [
  'message',
  'message.channels',
];

function route(api, request) {
  return new Promise(resolve => {
    if (typeof request.body !== 'object') {
      throw new Error('Unexepcted request format.');
    }

    console.log(JSON.stringify(request));

    // Slack sends a verification token with each request. We use this to verify
    // that the message is really coming from Slack and not someone else that
    // found our endpoint. The verification token is different for each
    // instance of Slack and can be found on the "Basic Information" page of the
    // app settings.
    if (request.body.token !== request.env.slackAppVerificationToken) {
      throw new Error('Invalid app verification token.');
    }

    // Slack asks us to verify the endpoint (once).
    if (request.body.type === 'url_verification') {
      console.log('Responding to Slack URL verification challenge....');
      resolve({ challenge: request.body.challenge });
      return;
    }

    if (request.body.type !== 'event_callback' || typeof request.body.event !== 'object') {
      throw new Error(`Unexpected event type: ${request.body.type}`);
    }

    // Event subscriptions are managed in the Slack App settings.
    if (supportedEventTypes.indexOf(request.body.event.type) === -1) {
      throw new Error(`Unsupported event type: ${request.body.event.type}`);
    }

    // Don't respond to other bots.
    if (request.body.event.bot_id) {
      console.log('Ignoring message from fellow bot, bye!');
      resolve();
      return;
    }
    
    validateTeam(request.body.event)
    .then(authorization => {
    
        if (!request.body.event.authorization.cleared) {
            sendToSlack(request.body.event, "I'm still waiting for the folks at DocumentCloud to say you can use my services!", function() {
                resolve();
                return;
            });      
        }
        
    })
    
    // Extract command words.
    const commandWords = request.body.event.text.trim().split(/\s+/);

    // For now, just see if the first word matches our bot name. We can get
    // fancier in our approach to this over time.
    if (botName !== commandWords[0]) {
      console.log('Ignoring message that is none of my beeswax, bye!');
      resolve();
      return;
    }

    request.body.event.command = {
      subject: commandWords[0],
      predicate: commandWords.splice(2).join(' '),
      verb: commandWords[1],
    };

    // Add API Gateway stage to message. We'll need this to determine where to
    // route the message.
    console.log(`Event posted to ${request.context.stage} stage.`);
    request.body.event.stage = request.context.stage;

    routeMessage(request.body.event).catch(respondOnError).then(resolve);

  })
  .then(response => {
    // We should respond to Slack with 200 to indicate that we've received the
    // event. If we do not, Slack will retry three times with back-off.
    return response || 'OK';
  })
  .catch(error => {
    // We should *still* respond to Slack with 200, we'll just log it.
    console.error(error.message);
    return 'OK';
  });
}

module.exports = route;
