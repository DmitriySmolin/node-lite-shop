let cart = {};

const addToCart = (e) => {
  e.preventDefault();
  let goodsId = e.target.dataset.goods_id;
  if (cart[goodsId]) {
    cart[goodsId] += 1;
  } else {
    cart[goodsId] = 1;
  }
  // console.log(cart);
  ajaxGetGoodsInfo();
};

document.querySelectorAll('.add-to-cart').forEach((el) => {
  el.addEventListener('click', addToCart);
});

// создание localstorage
const updateLocalStorageCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const ajaxGetGoodsInfo = () => {
  updateLocalStorageCart();
  fetch('get-goods-info', {
    method: 'POST',
    body: JSON.stringify({ key: Object.keys(cart) }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((body) => {
      // console.log(body);
      showCart(body);
    });
};

//есть ли данные в localstorage
if (localStorage.getItem('cart')) {
  cart = JSON.parse(localStorage.getItem('cart'));
  ajaxGetGoodsInfo();
}

const cartMinus = (e) => {
  console.log('minus');
  let goodsId = e.target.dataset.goods_id;
  console.log(goodsId);

  if (cart[goodsId] - 1 > 0) cart[goodsId] -= 1;
  else delete cart[goodsId];

  ajaxGetGoodsInfo();
};

const cartPlus = (e) => {
  console.log('plus');
  let goodsId = e.target.dataset.goods_id;
  console.log(goodsId);
  cart[goodsId] += 1;

  ajaxGetGoodsInfo();
};

const showCart = (data) => {
  let out = `<table class="table table-stripped table-cart>"
             <tbody>`;
  let total = 0;

  Object.values(data).forEach((item, idx) => {
    total += item.cost * cart[item.id];
    out += `
              <tr>
                <td colspan="4"><a href="/goods?id=${item.id}">${item.name}</a></td>
              </tr>
              <tr>
                <td><i class="far fa-minus-square cart-minus" data-goods_id=${item.id}></i></td>
                <td>${cart[item.id]}</td>
                <td><i class="far fa-plus-square cart-plus" data-goods_id=${item.id}></i></td>
                <td>${cart[item.id] * item.cost} ₽</td>
              </tr>
      
             `;
  });
  out += `    <tr>
              <td colspan="3">Total: </td>
              <td>${total} ₽</td>
              </tr>`;
  out += `</tbody>
         </table>`;
  document.querySelector('#cart-nav').innerHTML = out;

  document.querySelectorAll('.cart-minus').forEach((el) => {
    el.addEventListener('click', cartMinus);
  });

  document.querySelectorAll('.cart-plus').forEach((el) => {
    el.addEventListener('click', cartPlus);
  });
};
