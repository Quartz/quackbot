const config = require('../config');
const cropScreenshot = require('./crop-screenshot');
const getElementRect = require('./get-element-rect');
const injectStylesheet = require('./inject-stylesheet');
const { delay } = require('./utils');

function getCustomizations(url) {
  const key = Object.keys(config.customizations).find(domain => url.indexOf(domain) !== -1);
  return config.customizations[key] || {};
}

function captureScreenshot(client, url) {
  return new Promise((resolve, reject) => {    
    const customizations = getCustomizations(url);
    const { Emulation, Page, Runtime } = client;
    const timeout = setTimeout(reject, 1000 * 60);

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

    delay(1000)()
      .then(doInjection)
      .then(delay(config.screenshot.timeout))
      .then(getScreenshotBuffer)
      .then(doCrop)
      .then(buffer => {
        clearTimeout(timeout);
        resolve(buffer);
      });
  });
}

module.exports = captureScreenshot;
