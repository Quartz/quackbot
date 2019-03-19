const invokeLambdaFunction = require('../src/lambda-invoke-function');

const supportedPayloadBodyTypes = [
    'event_callback',
    'block_actions'
];

const supportedEventTypes = [
    'message',
    'message.channels',
    'block_actions'
];

function route(api, request) {
    return new Promise(resolve => {
                
        // check for valid body or payload
        if (typeof request.body !== 'object') {
            
            // see if it's a string beginning with "payload," 
            // which is how slack sends responses to block interactions
            if (typeof request.body == 'string' && request.body.match(/^payload=/)) {
                
                console.log("Handling incoming Slack block response.")
                request.body = JSON.parse(request.post.payload)
                request.body.event = JSON.parse(request.post.payload)
                
            // otherwise, we don't know what this is    
            } else {
                
                throw new Error('Unexepcted request format.');
                
            }
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

        // Event subscriptions are managed in the Slack App settings.
        if (supportedPayloadBodyTypes.indexOf(request.body.type) === -1) {
            console.log(`Unsupported payload body type: ${request.body.type}`);
            resolve();
            return;
        }
        
        if ( typeof request.body.event !== 'object') {
            console.log(`Event isn't an object: ${request.body.event}`);
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
        // Later, to allow file uploads, use next line instead
        // if (request.body.event.hasOwnProperty('subtype') && request.body.event.subtype != 'file_share') {
        if (request.body.event.hasOwnProperty('subtype')) {
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
        console.log(`Incoming event sent to slack-events-api-message-handler's ${request.context.stage} stage.`);
        request.body.event.stage = request.context.stage;
        
        // Also add the stage's environment variables to the message so 
        // we use the right database and all
        request.body.event.env = request.env;
        request.body.event.team_id = request.body.team_id || request.body.team.id;

        // Invoke router Lambda function.
        resolve(invokeLambdaFunction(request.body.event, 'slack-events-api-message-handler'));
    })
        .then((response) => {
        // We should respond to Slack with 200 to indicate that we've received the
        // event. If we do not, Slack will retry three times with back-off.
            console.log("Said 'OK' to Slack.");
            return response || new api.ApiResponse('OK', { 'Content-Type': 'text/plain' }, 200);
        })
        .catch(error => {
        // We should *still* respond to Slack with 200, we'll just log it.
            console.error(error.message);
            return new api.ApiResponse('OK', { 'Content-Type': 'text/plain' }, 200);
        });
}

module.exports = route;
