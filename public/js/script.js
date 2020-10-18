const toCurrency = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'rub',
    style: 'currency',
  }).format(price);
};

document.querySelectorAll('p').forEach((node) => {
  node.textContent = toCurrency(node.textContent);
});


