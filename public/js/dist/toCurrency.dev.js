"use strict";

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

addClass('p.text-center');
addClass('span.success mark');
addClass('.total');