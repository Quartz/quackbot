const Lambda = require('aws-sdk/clients/lambda');

const lambda = new Lambda();

function invokeLambdaFunction(payload, functionName) {
    const lambdaOptions = {
        FunctionName: functionName,
        InvocationType: 'Event',
        Payload: JSON.stringify(payload),
    };

    // Omitting the Qualifier property results in running the $LATEST version.
    if (payload.stage !== 'latest') {
        lambdaOptions.Qualifier = payload.stage;
    }

    return new Promise((resolve, reject) => {
        lambda.invoke(lambdaOptions, (error, data) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

module.exports = invokeLambdaFunction;
