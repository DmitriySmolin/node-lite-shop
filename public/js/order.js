document.getElementById('lite-shop-order').addEventListener('submit', (e) => {
  e.preventDefault();
  let username = document.getElementById('username').value.trim();
  let phone = document.getElementById('phone').value.trim();
  let email = document.getElementById('email').value.trim();
  let address = document.getElementById('address').value.trim();

  if (!document.getElementById('rule').checked) {
    //с правилами не согласен
  }

  if (username === '' || phone === '' || email === '' || address === '') {
    // не заполнены поля
  }

  fetch('/finish-order', {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      phone: phone,
      email: email,
      address: address,
      key: JSON.parse(localStorage.getItem('cart')),
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((body) => {
      if (body === 1) {
        console.log(body);
      } else {
      }
    });
});
