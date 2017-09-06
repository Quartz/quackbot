const Lambda = require('aws-sdk/clients/lambda');

const lambda = new Lambda();

function invokeLambdaFunction(payload, functionName, triggerAsync = false) {
  const lambdaOptions = {
    FunctionName: functionName,
    Payload: JSON.stringify(payload),
  };

  // Omitting the Qualifier property results in running the $LATEST version.
  if (payload.stage !== 'latest') {
    lambdaOptions.Qualifier = payload.stage;
  }

  // Async functions might take longer to respond than our timeout will allow.
  // Invoke them as an event and don't wait for a response.
  if (triggerAsync) {
    lambdaOptions.InvocationType = 'Event';
  }

  return new Promise((resolve, reject) => {
    lambda.invoke(lambdaOptions, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      console.log('Received Lambda response....', data);

      try {
        // An empty payload corresponds to an event invocation. A syncronous
        // invocation may also choose to return an empty payload to signal that
        // it intends to respond later.
        if (data.Payload === '') {
          resolve(null);
          return;
        }

        resolve(JSON.parse(data.Payload));
      } catch (parseError) {
        reject(new Error('Could not parse Lambda function response'));
      }
    });
  });
}

module.exports = invokeLambdaFunction;
