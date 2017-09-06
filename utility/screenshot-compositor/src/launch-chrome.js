const cdp = require('chrome-remote-interface');
const lambdaChrome = require('@serverless-chrome/lambda');

const defaults = {
  debug: true,
  flags: [],
  port: 9222,
  timeout: 1000 * 10,
  tmpDir: '/tmp',
};

function getCdpInstance(options) {
  return new Promise((resolve, reject) => {
    if (options.debug) {
      cdp.Version((err, info) => {
        console.log('CDP version info:', info);
      });
    }

    cdp({ port: options.port }, resolve).on('error', reject);
  });
}

function getChromeFlags(options) {
  return [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--enable-logging',
    '--log-level=0',
    '--v=99',
    '--single-process',
    `--remote-debugging-port=${options.port}`,
    `--user-data-dir=${options.tmpDir}/user-data`,
    `--data-path=${options.tmpDir}/data-path`,
    `--homedir=${options.tmpDir}`,
    `--disk-cache-dir=${options.tmpDir}/cache-dir`,
  ].concat(options.flags);
}

function getOptions(userOptions) {
  const options = Object.assign({}, defaults, userOptions);
  options.flags = getChromeFlags(options);
  return options;
}

function launchChrome(userOptions = {}) {
  const options = getOptions(userOptions);
  return lambdaChrome().then(() => getCdpInstance(options));
}

module.exports = launchChrome;
