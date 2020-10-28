"use strict";

document.getElementById('lite-shop-order').addEventListener('submit', function (e) {
  e.preventDefault();
  var username = document.getElementById('username').value.trim();
  var phone = document.getElementById('phone').value.trim();
  var email = document.getElementById('email').value.trim();
  var address = document.getElementById('address').value.trim();

  if (!document.getElementById('rule').checked) {//с правилами не согласен
  }

  if (username === '' || phone === '' || email === '' || address === '') {// не заполнены поля
  }

  fetch('/finish-order', {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      phone: phone,
      email: email,
      address: address,
      key: JSON.parse(localStorage.getItem('cart'))
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (res) {
    return res.json();
  }).then(function (body) {
    if (body === 1) {
      console.log(body);
    } else {}
  });
});