// Extract an SNS message as passed to Lambda.
function getSnsMessage(lambdaEvent) {
  let message;

  try {
    message = JSON.parse(lambdaEvent.Records[0].Sns.Message);
  } catch (error) {
    throw new Error('Unable to extract SNS message');
  }

  console.log('Received SNS message:', message);
  return message;
}

module.exports = getSnsMessage;
