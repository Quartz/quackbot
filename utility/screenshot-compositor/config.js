const customizations = {
  'twitter.com': {
    cropElement: '.permalink-tweet',
    stylesheet: 'inject/css/twitter.css',
  }
};

const s3 = {
  bucket: 'qz-screenshots',
  cloudfront: 'https://d1gdla0ognurmx.cloudfront.net',
};

// `fromSurface: true` is needed on OS X.
const screenshot = {
  format: 'png',
  timeout: 5000,
};

module.exports = {
  customizations,
  s3,
  screenshot,
};
