const invokeLambdaFunction = require('../src/lambda-invoke-function');

function respondOnError(error) {
  const payload = {
    message: error.message,
  };

  return invokeLambdaFunction(payload, 'need-to-write-this');
}

module.exports = respondOnError;
