const port = 9222;

const chromeFlags = [
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--user-data-dir=/tmp/user-data',
  '--hide-scrollbars',
  '--enable-logging',
  '--log-level=0',
  '--v=99',
  '--single-process',
  '--data-path=/tmp/data-path',
  `--remote-debugging-port=${port}`,
  '--ignore-certificate-errors',
  '--homedir=/tmp',
  '--disk-cache-dir=/tmp/cache-dir',
];

const chrome = {
  headlessPort: port,
  headlessUrl: `http://127.0.0.1:${port}`,
  pageLoadTimeout: 1000 * 60,
  path: '/tmp/headless-chrome/headless_shell',
  startupTimeout: 1000 * 10,
};

const customizations = {
  'twitter.com': {
    cropElement: '.permalink-tweet',
    stylesheet: 'inject/css/twitter.css',
  }
};

const s3 = {
  bucket: 'quack-screenshots',
};

// `fromSurface: true` is needed on OS X.
const screenshot = {
  format: 'png',
  timeout: 5000,
};

module.exports = {
  chromeFlags,
  chrome,
  customizations,
  s3,
  screenshot,
};
