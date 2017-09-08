const invokeLambdaFunction = require('../src/lambda-invoke-function');

function respondOnError(errorMessage) {
  const payload = {
    message: errorMessage,
  };

  console.error(`Responding to user with error: ${errorMessage}`);

  // @todo Write the Lambda function that responds if there is an error.
  // return invokeLambdaFunction(payload, 'need-to-write-this');

  return Promise.resolve('OK');
}

module.exports = respondOnError;
