// console.log('nav.js');

const closeNav = () => {
  document.querySelector('.site-nav').style.left = `${-300}px`;
};

const showNav = () => {
  document.querySelector('.site-nav').style.left = '0';
};

try {
  document.querySelector('.close-nav').addEventListener('click', closeNav);
  document.querySelector('.show-nav').addEventListener('click', showNav);
} catch (error) {}

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

  try {
    document.getElementById('category-list').innerHTML = out;
  } catch (error) {}
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
