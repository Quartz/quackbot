const crypto = require('crypto');
const S3 = require('aws-sdk/clients/s3');

const config = require('../config');

function saveToS3(buffer) {
  // Generate hash suffix for filename.
  const hash = crypto.createHmac('sha512', '41ecde00bfbe5b8ca3b82601b749bdf3');
  hash.update(`${Date.now()}`);

  const s3Params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: config.s3.bucket,
    ContentType: 'image/jpeg',
    Key: `compositebot/${hash.digest('hex').substr(0, 16)}.jpg`,
  };

  console.log('Saving screenshot to S3....');
  return saveImage(s3Params);
}

function saveImage(s3Params) {
  const s3 = new S3();

  return new Promise((resolve, reject) => {
    s3.putObject(s3Params, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        etag: data.ETag,
        key: s3Params.Key,
      });
    });
  });
}

module.exports = saveToS3;
