const gm = require('gm').subClass({ imageMagick: true });

function combineImages(fileArray) {
  console.log(`Combining images....`);
  return new Promise((resolve, reject) => {
    gm(fileArray[0])
      .append(fileArray[1], false)
      .shave(1, 1)
      .toBuffer('jpg', (error, newBuffer) => {
        if (error) {
          console.error('Error converting to JPEG....', error);
          reject(error);
          return;
        }

        resolve(newBuffer);
      });
  });
}

module.exports = combineImages;
