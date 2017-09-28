const S3 = require('aws-sdk/clients/s3');

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

module.exports = saveImage;
