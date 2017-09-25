const https = require('https');
const qs = require('querystring');

// This function requires the original event since replying in the same channel
// is the only supported flow.
function sendToSlack(slackEvent, reply) {
  if (!reply) {
    console.log('OK: nothing to say');
    return Promise.resolve();
  }

  return new Promise(resolve => {
    const slackMessage = {
      token: process.env.SLACK_BOT_TOKEN,
      channel: slackEvent.channel,
      text: reply,
    };
    const requestUrl = `https://slack.com/api/chat.postMessage?${qs.stringify(slackMessage)}`;

    // Send message.
    https.get(requestUrl, (res) => {
      console.log(`OK: responded, slack gave ${res.statusCode}`);
      resolve();
    }).on('error', (err) => {
      console.error(`ERROR: responded, but slack gave ${err.message}`);
      resolve();
    });
  });
}

module.exports = sendToSlack;