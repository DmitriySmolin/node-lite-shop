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


  ajaxGetGoodsInfo();
};

document.querySelectorAll('.add-to-cart').forEach(function (el) {
  el.addEventListener('click', addToCart);
}); // создание localstorage

var updateLocalStorageCart = function updateLocalStorageCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
};

var ajaxGetGoodsInfo = function ajaxGetGoodsInfo() {
  updateLocalStorageCart();
  fetch('/get-goods-info', {
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
    // console.log(body);
    showCart(body);
  });
}; //есть ли данные в localstorage


if (localStorage.getItem('cart')) {
  cart = JSON.parse(localStorage.getItem('cart'));
  ajaxGetGoodsInfo();
}

var cartMinus = function cartMinus(e) {
  console.log('minus');
  var goodsId = e.target.dataset.goods_id;
  console.log(goodsId);
  if (cart[goodsId] - 1 > 0) cart[goodsId] -= 1;else delete cart[goodsId];
  ajaxGetGoodsInfo();
};

var cartPlus = function cartPlus(e) {
  console.log('plus');
  var goodsId = e.target.dataset.goods_id;
  console.log(goodsId);
  cart[goodsId] += 1;
  ajaxGetGoodsInfo();
};

var showCart = function showCart(data) {
  var out = "<table class=\"table table-stripped table-cart>\"\n             <tbody>";
  var total = 0;

  var toCurrency = function toCurrency(price) {
    return new Intl.NumberFormat('ru-RU', {
      currency: 'rub',
      style: 'currency'
    }).format(price);
  };

  Object.values(data).forEach(function (item, idx) {
    total += item.cost * cart[item.id];
    out += "\n              <tr>\n                <td colspan=\"4\"><a href=\"/goods/".concat(item.id, "\">").concat(item.name, "</a></td>\n              </tr>\n              <tr>\n                <td><i class=\"far fa-minus-square cart-minus\"  data-goods_id=").concat(item.id, "></i></td>\n                <td>").concat(cart[item.id], "</td>\n                <td><i class=\"far fa-plus-square cart-plus\" data-goods_id=").concat(item.id, "></i></td>\n                <td>").concat(toCurrency(cart[item.id] * item.cost), " </td>\n              </tr>\n             ");
  });
  out += "    <tr>\n              <td colspan=\"3\">Total: </td>\n              <td>".concat(toCurrency(total), "</td>\n              </tr>");
  out += "</tbody>\n         </table>";
  document.querySelector('#cart-nav').innerHTML = out;
  document.querySelectorAll('.cart-minus').forEach(function (el) {
    el.addEventListener('click', cartMinus);
  });
  document.querySelectorAll('.cart-plus').forEach(function (el) {
    el.addEventListener('click', cartPlus);
  });
};