const fs = require('fs');

const captureScreenshot = require('./src/capture-screenshot');
const combineImages = require('./src/combine-images');
const config = require('./config');
const launchChrome = require('./src/launch-chrome');
const prepareChrome = require('./src/prepare-chrome');
const saveToS3 = require('./src/save-to-s3');

exports.handler = (payload, context, callback) => {
  const loadPages = client => {
    const { Page } = client;
    const images = [];

    const saveBuffer = buffer => {
      var path = '/tmp/image' + images.length + '.png';

      return new Promise((resolve, reject) => {
        fs.open(path, 'w', (err, fd) => {
          fs.write(fd, buffer, 0, buffer.length, null, err => {
            fs.close(fd, function() {
              images.push(path);
              resolve();
            });
          });
        });
      });
    };

    return new Promise((resolve, reject) => {
      let url;

      const loadPage = () => {
        if (!payload.urls.length) {
          client.close().then(() => resolve(images));
          return;
        }

        url = payload.urls.shift();
        Page.navigate({ url });
      };

      const onPageLoad = () => captureScreenshot(client, url).then(saveBuffer).then(loadPage);

      Page.loadEventFired(onPageLoad);
      loadPage();
    });
  };

  launchChrome()
    .then(client => prepareChrome(client))
    .then(loadPages)
    .then(combineImages)
    .then(saveToS3)
    .then(s3Response => {
      console.log('Generated composite....', s3Response);
      callback(null, `${config.s3.cloudfront}/${s3Response.key}`);
    })
    .catch(err => {
      console.error(err);
      callback(new Error('Could not generate screenshot.'));
    });
}
