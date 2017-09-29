const invokeLambdaFunction = require('../src/lambda-invoke-function');

const supportedEventTypes = [
    'message',
    'message.channels'
];

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
            console.log('Invalid app verification token.');
            resolve();
            return;
        }

        // Slack asks us to verify the endpoint (once).
        if (request.body.type === 'url_verification') {
            console.log('Responding to Slack URL verification challenge....');
            resolve({ challenge: request.body.challenge });
            return;
        }

        if (request.body.type !== 'event_callback' || typeof request.body.event !== 'object') {
            console.log(`Unexpected event type: ${request.body.type}`);
            resolve();
            return;
        }

        // Event subscriptions are managed in the Slack App settings.
        if (supportedEventTypes.indexOf(request.body.event.type) === -1) {
            console.log(`Unsupported event type: ${request.body.event.type}`);
            resolve();
            return;
        }

        // Skip altered messages for now to avoid bot confusion
        if (request.body.event.hasOwnProperty('subtype') && request.body.event.subtype == 'message') {
            console.log(`Subtype of "${request.body.event.subtype}" suggests a modified message. Skipping.`);
            resolve();
            return;
        }

        // Don't respond to other bots.
        if (request.body.event.bot_id) {
            console.log('Ignoring message from myself or a fellow bot, bye!');
            resolve();
            return;
        }

        // Add API Gateway stage to message. We'll need this to determine where to
        // route the message.
        console.log(`Incoming event sent to ${request.context.stage} stage.`);
        request.body.event.stage = request.context.stage;

        // Invoke router Lambda function.
        resolve(invokeLambdaFunction(request.body.event, 'slack-events-api-message-handler'));
    })
    .then(() => {
        // We should respond to Slack with 200 to indicate that we've received the
        // event. If we do not, Slack will retry three times with back-off.
        console.log("Said 'OK' to Slack.");
        return new api.ApiResponse('OK', { 'Content-Type': 'text/plain' }, 200);
    })
    .catch(error => {
        // We should *still* respond to Slack with 200, we'll just log it.
        console.error(error.message);
        return new api.ApiResponse('OK', { 'Content-Type': 'text/plain' }, 200);
    });
}

module.exports = route;
