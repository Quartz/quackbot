// Set up viewport resolution, etc.
const deviceMetrics = {
  width: 1200,
  height: 1200,
  deviceScaleFactor: 2,
  mobile: false,
  fitWindow: true,
};

function prepareChrome(client) {
  return new Promise((resolve, reject) => {
    const { Emulation, Page, Runtime } = client;

    const preparation = [
      Page.enable(),
      Runtime.enable(),
      Emulation.setDeviceMetricsOverride(deviceMetrics),
      Emulation.setVisibleSize({ width: deviceMetrics.width, height: deviceMetrics.height }),
    ].reduce((p, fn) => p.then(fn), Promise.resolve());

    preparation.then(() => {
      resolve(client);
    })
  });
}

module.exports = prepareChrome;
