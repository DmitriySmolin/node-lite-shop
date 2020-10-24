"use strict";

var cart = {};

var addToCart = function addToCart(e) {
  e.preventDefault();
  var goodsId = e.target.dataset.goods_id;

  if (cart[goodsId]) {
    cart[goodsId] += 1;
  } else {
    cart[goodsId] = 1;
  } // console.log(cart);


  ajaxGetFoods();
};

document.querySelectorAll('.add-to-cart').forEach(function (el) {
  el.addEventListener('click', addToCart);
});

var ajaxGetFoods = function ajaxGetFoods() {
  fetch('get-goods-info', {
    method: 'POST',
    body: JSON.stringify({
      key: Object.keys(cart)
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (res) {
    return res.json();
  }).then(function (body) {
    return console.log(body);
  });
};