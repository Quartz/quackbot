const invokeLambdaFunction = require('../src/lambda-invoke-function');
const sendToSlack = require('../src/slack-send-message');

function respondOnError(event, errorMessage) {
    const payload = {
        message: errorMessage,
    };

    console.error(`Responding to user with error: ${errorMessage}`);

    sendToSlack(event, errorMessage);

    return Promise.resolve('OK');
}

module.exports = respondOnError;
