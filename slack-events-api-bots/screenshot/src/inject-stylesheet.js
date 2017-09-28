/* global document */

const fs = require('fs');
const path = require('path');

const inject = (cssString) => {
  const addTo = (doc) => {
    const style = doc.createElement('style');
    style.type = 'text/css';
    style.innerHTML = cssString;

    doc.querySelector('head').appendChild(style);
  };

  addTo(document);

  const cardFrame = document.querySelector('.card2 iframe');
  if (cardFrame) {
    console.log('Injecting in Twitter card frame....');
    addTo(cardFrame.contentDocument);
  }
};

function injectStylesheet(stylesheet) {
  console.log(`Injecting stylesheet ${stylesheet}....`);

  const data = fs.readFileSync(path.resolve(stylesheet));
  const cssString = data.toString().replace(/\n/g, '');
  const injectString = inject.toString().replace(/\n/g, '');

  return `(${injectString})('${cssString}')`;
}

module.exports = injectStylesheet;
