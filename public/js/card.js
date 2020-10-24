const cart = {};

const addToCart = (e) => {
  e.preventDefault();
  let goodsId = e.target.dataset.goods_id;
  if (cart[goodsId]) {
    cart[goodsId] += 1;
  } else {
    cart[goodsId] = 1;
  }
  // console.log(cart);
  ajaxGetFoods();
};

document.querySelectorAll('.add-to-cart').forEach((el) => {
  el.addEventListener('click', addToCart);
});

const ajaxGetFoods = () => {
  fetch('get-goods-info', {
    method: 'POST',
    body: JSON.stringify({ key: Object.keys(cart) }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((body) => console.log(body));
};
