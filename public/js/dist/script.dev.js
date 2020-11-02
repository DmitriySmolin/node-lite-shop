"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addClass = void 0;

var toCurrency = function toCurrency(price) {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency'
  }).format(price);
};

var addClass = function addClass(selector) {
  document.querySelectorAll(selector).forEach(function (node) {
    node.textContent = toCurrency(node.textContent);
  });
};

exports.addClass = addClass;