const toCurrency = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency',
  }).format(price);
};

const addClass = (selector) => {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = toCurrency(node.textContent);
  });
};

addClass('p.text-center');
addClass('span.success mark');
