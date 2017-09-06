const queryString = require('querystring');
const processMessage = require('../src/process-message');
const routeMessage = require('../src/route-message');

function route(api, request) {
  return new Promise((resolve) => {
    // The message is POSTed to our endpoint as form data.
    const message = queryString.parse(request.body);

    // Slack sends a verification token with each request. We use this to verify
    // that the message is really coming from Slack and not someone else that
    // found our endpoint. The verification token is different for each
    // instance of Slack and can be found on the "Basic Information" page of the
    // app settings.
    if (message.token !== request.env.slackAppVerificationToken) {
      throw new Error('Invalid app verification token.');
    }

    // Add API Gateway stage to message. We'll need this to determine where to
    // route the message.
    console.log(`Message posted to ${request.context.stage} stage.`);
    message.stage = request.context.stage;

    resolve(processMessage(message));
  })
  .then(routeMessage)
  .then((response) => {
    // Returning an object means that API Gateway should respond to Slack with
    // 200 and with that object as the response body. This is how we respond
    // to the slash command.

    // If the response is a string, we've been given an immediate response. Post
    // it publicly in the channel.
    if (response && typeof response === 'string') {
      console.log(`Responding publicly with: ${response}`);

      return {
        response_type: 'in_channel',
        text: response,
      };
    }

    // If the response is an object, assume the response is an Slack message
    // object and pass it through.
    if (response && typeof response === 'object') {
      console.log('Passing response through....', response);
      return response;
    }

    // If there the response is falsy, we published to an SNS topic and we
    // don't actually want to respond to the user yet. Send an empty response.
    // This lets Slack know that we've acknowledged the command.
    return new api.ApiResponse('', { 'Content-Type': 'text/plain' }, 200);
  })
  .catch((error) => {
    console.error(error);

    // Something went wrong. Provide an private response to the user.
    return Promise.resolve({
      response_type: 'ephemeral',
      text: error.message || 'An unknown error occurred',
    });
  });
}

module.exports = route;
