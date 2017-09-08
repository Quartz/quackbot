const invokeLambdaFunction = require('../src/lambda-invoke-function');

function respondOnError(error) {
  const payload = {
    message: error.message,
  };

  console.error(`Responding to user with error: ${error.message}`);

  // @todo Write the Lambda function that responds if there is an error.
  // return invokeLambdaFunction(payload, 'need-to-write-this');

  return Promise.resolve('OK');
}

module.exports = respondOnError;
