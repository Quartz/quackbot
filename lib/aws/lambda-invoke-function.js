const Lambda = require('aws-sdk/clients/lambda');

const lambda = new Lambda();

function invokeLambdaFunction(payload, functionName, triggerAsync = false) {
  // Omitting the "Qualifier" property results in running "latest."
  const lambdaOptions = {
    FunctionName: functionName,
    Payload: JSON.stringify(payload),
  };

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
        resolve(JSON.parse(data.Payload));
      } catch (parseError) {
        reject(new Error('Could not parse Lambda function response'));
      }
    });
  });
}

module.exports = invokeLambdaFunction;
