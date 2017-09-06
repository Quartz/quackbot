const SNS = require('aws-sdk/clients/sns');

const sns = new SNS();

function publishSnsMessage(snsMessage, topicArn) {
  const payload = {
    Message: JSON.stringify(snsMessage),
    TopicArn: topicArn,
  };

  return new Promise((resolve) => {
    sns.publish(payload, (error, data) => {
      if (error) {
        throw new Error(`Could not publish to ${topicArn}: ${error.message}`);
      }

      resolve(`OK: published SNS message ${data.MessageId} to ${topicArn}`);
    });
  });
}

module.exports = publishSnsMessage;
