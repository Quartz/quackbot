const SNS = require('aws-sdk/clients/sns');

const sns = new SNS();

function publishSnsMessage(snsMessage, topicArn) {
  const payload = {
    Message: JSON.stringify(snsMessage),
    TopicArn: topicArn,
  };

  return new Promise((resolve, reject) => {
    sns.publish(payload, (error, data) => {
      if (error) {
        console.error(`Could not publish to ${topicArn}: ${error.message}`);
        reject(new Error('Sorry, I’m having trouble routing your request.'));
        return;
      }

      console.log(`Published SNS message ${data.MessageId} to ${topicArn}.`);
      resolve();
    });
  });
}

module.exports = publishSnsMessage;
