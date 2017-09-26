const https = require('https');
const qs = require('querystring');

// This function requires the original event since replying in the same channel
// is the only supported flow.
function sendToSlack(slackEvent, reply, callback) {
  if (!reply) {
    return callback(null, 'OK: nothing to say');
  }

  const slackMessage = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: slackEvent.channel,
    text: reply,
  };
  const requestUrl = `https://slack.com/api/chat.postMessage?${qs.stringify(slackMessage)}`;

  // Send message.
  https.get(requestUrl, (res) => {
    callback(null, `OK: responded, slack gave ${res.statusCode}`);
  }).on('error', (err) => {
    callback(`ERROR: responded, but slack gave ${err.message}`);
  });
}

module.exports = sendToSlack;
