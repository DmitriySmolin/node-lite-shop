// console.log('nav.js');

const closeNav = () => {
  document.querySelector('.site-nav').style.left = `${-300}px`;
};

const showNav = () => {
  document.querySelector('.site-nav').style.left = '0';
};

document.querySelector('.close-nav').addEventListener('click', closeNav);
document.querySelector('.show-nav').addEventListener('click', showNav);

const showCategoryList = (data) => {
  // console.log(data);
  let out = `<ul class="category-list">
                <li>
                    <a href="/">Main</a>
                </li>
             `;
  data.forEach((item) => {
    out += `  <li>
                   <a href="/cat?id=${item.id}">${item.category}</a>
              </li>`;
  });
  out += `</ul>`;
  document.getElementById('category-list').innerHTML = out;
};

const getCategoryList = () => {
  fetch('/get-category-list', {
    method: 'POST',
  })
    .then((response) => {
      // console.log(response);
      return response.text();
    })
    .then((body) => {
      // console.log(body);
      showCategoryList(JSON.parse(body));
    });
};

getCategoryList();
