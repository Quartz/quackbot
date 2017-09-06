const https = require('https');
const url = require('url');

// This function requires the original message since using the provided
// response_url is the only supported flow.
function replyToSlashCommand(originalMessage, reply) {
  const postData = JSON.stringify(reply);
  const urlParts = url.parse(originalMessage.response_url);

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
    hostname: urlParts.host,
    method: 'POST',
    path: urlParts.path,
    port: urlParts.port || 443,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`OK: Slack responded with ${res.statusCode}`);
      resolve();
    });

    req.on('error', (err) => {
      console.log(`Slack responded with ${err.message}`);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

module.exports = replyToSlashCommand;
