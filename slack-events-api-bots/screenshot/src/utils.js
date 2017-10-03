function delay(timeout) {
  return value => new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, timeout);
  });
}

module.exports = {
  delay,
};
