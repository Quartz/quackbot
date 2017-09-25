const gm = require('gm').subClass({ imageMagick: true });

function cropScreenshot(buffer, response) {
  const rect = response.result.value;

  console.log('Cropping screenshot....');
  return new Promise((resolve, reject) => {
    gm(buffer)
      .crop(rect.width, rect.height, rect.left, rect.top)
      .toBuffer('png', (error, newBuffer) => {
        if (error) {
          console.error('Error cropping screenshot....', error);
          reject(error);
          return;
        }

        resolve(newBuffer);
      });
  });
}

module.exports = cropScreenshot;
