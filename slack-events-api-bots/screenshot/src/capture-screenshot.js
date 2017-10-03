const crypto = require('crypto');
const gm = require('gm').subClass({ imageMagick: true });

const config = require('../config');
const cropScreenshot = require('./crop-screenshot');
const getElementRect = require('./get-element-rect');
const injectStylesheet = require('./inject-stylesheet');
const saveImage = require('./save-image');
const { delay } = require('./utils');

// Set up viewport resolution, etc.
const deviceMetrics = {
  width: 1200,
  height: 1000,
  deviceScaleFactor: 2,
  mobile: false,
  fitWindow: true,
};

function saveToS3(buffer, url) {
  // Generate hash suffix for filename.
  const hash = crypto.createHmac('sha512', '41ecde00bfbe5b8ca3b82601b749bdf3');
  hash.update(url);

  const s3Params = {
    ACL: 'public-read',
    Body: buffer,
    Bucket: config.s3.bucket,
    ContentType: 'image/jpeg',
    Key: `screenbot/${hash.digest('hex').substr(0, 16)}.jpg`,
  };

  console.log('Saving screenshot to S3....');
  return saveImage(s3Params);
}

function getCustomizations(url) {
  const key = Object.keys(config.customizations).find(domain => url.indexOf(domain) !== -1);
  return config.customizations[key] || {};
}

function convertScreenshot(buffer) {
  console.log('Converting to JPEG....');

  return new Promise((resolve, reject) => {
    gm(buffer).toBuffer('jpg', (error, newBuffer) => {
      if (error) {
        console.error('Error converting to JPEG....', error);
        reject(error);
        return;
      }

      resolve(newBuffer);
    });
  });
}

function captureScreenshot(client, url) {
  const customizations = getCustomizations(url);

  return new Promise((resolve, reject) => {
    const { Emulation, Page, Runtime } = client;
    const timeout = setTimeout(reject, config.chrome.pageLoadTimeout);

    const doCrop = (buffer) => {
      if (!customizations.cropElement) {
        return buffer;
      }

      return Runtime.evaluate({
        expression: getElementRect(customizations.cropElement),
        returnByValue: true,
      })
      .then(response => cropScreenshot(buffer, response))
      .catch(() => Promise.resolve(buffer));
    };

    const doInjection = () => {
      if (!customizations.stylesheet) {
        return Promise.resolve();
      }

      return Runtime.evaluate({
        expression: injectStylesheet(customizations.stylesheet),
      });
    };

    const getScreenshotBuffer = () => {
      console.log('Taking screenshot....');
      return Page.captureScreenshot(config.screenshot).then(screenshot => Buffer.from(screenshot.data, 'base64'));
    };

    const saveScreenshot = buffer => saveToS3(buffer, url).then((s3Response) => {
      client.close().then(() => {
        clearTimeout(timeout);
        resolve(s3Response);
      });
    });

    Page.loadEventFired(() => {
      delay(1000)()
        .then(doInjection)
        .then(delay(config.screenshot.timeout))
        .then(getScreenshotBuffer)
        .then(doCrop)
        .then(convertScreenshot)
        .then(saveScreenshot);
    });

    [
      Page.enable(),
      Runtime.enable(),
      Emulation.setDeviceMetricsOverride(deviceMetrics),
      Emulation.setVisibleSize({ width: deviceMetrics.width, height: deviceMetrics.height }),
      Page.navigate({ url }),
    ].reduce((p, fn) => p.then(fn), Promise.resolve());
  });
}

module.exports = captureScreenshot;
