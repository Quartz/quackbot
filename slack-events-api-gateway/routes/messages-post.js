const invokeLambdaFunction = require('../src/lambda-invoke-function');

function route(api, request) {
    return new Promise(resolve => {
        if (typeof request.body !== 'object') {
            throw new Error('Unexepcted request format.');
        }

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

        // Skip altered messages for now to avoid bot confusion
        if (request.body.event.hasOwnProperty('subtype')) {
            throw new Error(`Unsupported event subtype: ${request.body.event.subtype}`);
        }

        // Don't respond to other bots.
        if (request.body.event.bot_id) {
            console.log('Ignoring message from fellow bot, bye!');
            resolve();
            return;
        }

        // Add API Gateway stage to message. We'll need this to determine where to
        // route the message.
        console.log(`Event posted to ${request.context.stage} stage.`);
        request.body.event.stage = request.context.stage;

        // Invoke router Lambda function.
        return invokeLambdaFunction(request.body.event, 'slack-events-api-message-handler');
    })
    .then(() => {
      // We should respond to Slack with 200 to indicate that we've received the
      // event. If we do not, Slack will retry three times with back-off.
      return 'OK';
    })
    .catch(error => {
    // We should *still* respond to Slack with 200, we'll just log it.
      console.error(error.message);
      return 'OK';
    });
}

module.exports = route;
