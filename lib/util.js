'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = noop;
exports.toArray = toArray;
exports.assign = assign;
exports.css = css;
exports.addClass = addClass;
exports.removeClass = removeClass;
exports.remove = remove;
exports.createDom = createDom;
exports.getLengthAngle = getLengthAngle;
function noop() {}

function toArray(list) {
  if (!(list instanceof NodeList || list instanceof HTMLCollection)) return [list];
  return Array.prototype.slice.call(list);
}

function assign(target) {
  for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    rest[_key - 1] = arguments[_key];
  }

  rest.forEach(function (obj) {
    Object.keys(obj).forEach(function (key) {
      target[key] = obj[key]; // eslint-disable-line no-param-reassign
    });
  });
  return target;
}

function css(element, properties) {
  if (typeof properties === 'string') {
    return window.getComputedStyle(element)[properties];
  }

  Object.keys(properties).forEach(function (key) {
    var value = properties[key];
    element.style[key] = value; // eslint-disable-line no-param-reassign
  });

  return undefined;
}

function addClass(el, className) {
  var classNameAry = className.split(' ');

  if (classNameAry.length > 1) {
    classNameAry.forEach(function (classItem) {
      return addClass(el, classItem);
    });
  } else if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className; // eslint-disable-line no-param-reassign
  }
}

function removeClass(el, className) {
  var classNameAry = className.split(' ');
  if (classNameAry.length > 1) {
    classNameAry.forEach(function (classItem) {
      return removeClass(el, classItem);
    });
  } else if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' '); // eslint-disable-line no-param-reassign
  }
}

function remove(nodes) {
  toArray(nodes).forEach(function (el) {
    el.parentNode.removeChild(el);
  });
}

function createDom(str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  return div.children[0];
}

// return height and angle for lines
function getLengthAngle(x1, x2, y1, y2) {
  var xDiff = x2 - x1;

  var yDiff = y2 - y1;

  return {
    length: Math.ceil(Math.sqrt(xDiff * xDiff + yDiff * yDiff)),
    angle: Math.round(Math.atan2(yDiff, xDiff) * 180 / Math.PI)
  };
}