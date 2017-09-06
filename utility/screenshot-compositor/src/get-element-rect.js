/* global document */

const inject = (selector) => {
  const el = document.querySelector(selector);
  const rect = el ? el.getBoundingClientRect() : {};

  return {
    bottom: rect.bottom,
    height: rect.height,
    left: rect.left,
    right: rect.right,
    top: rect.top,
    width: rect.width,
  };
};

function getElementRect(selector) {
  console.log(`Getting bounding rect for ${selector}....`);
  return `(${inject.toString()})('${selector}')`;
}

module.exports = getElementRect;
