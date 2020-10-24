"use strict";

console.log('nav.js');

var closeNav = function closeNav() {
  document.querySelector('.site-nav').style.left = "".concat(-300, "px");
};

var showNav = function showNav() {
  document.querySelector('.site-nav').style.left = '0';
};

document.querySelector('.close-nav').addEventListener('click', closeNav);
document.querySelector('.show-nav').addEventListener('click', showNav);

var showCategoryList = function showCategoryList(data) {
  console.log(data);
  var out = "<ul class=\"category-list\">\n                <li>\n                    <a href=\"/\">Main</a>\n                </li>\n             ";
  data.forEach(function (item) {
    out += "  <li>\n                   <a href=\"/cat?id=".concat(item.id, "\">").concat(item.category, "</a>\n              </li>");
  });
  out += "</ul>";
  document.getElementById('category-list').innerHTML = out;
};

var getCategoryList = function getCategoryList() {
  fetch('/get-category-list', {
    method: 'POST'
  }).then(function (response) {
    console.log(response);
    return response.text();
  }).then(function (body) {
    console.log(body);
    showCategoryList(JSON.parse(body));
  });
};

getCategoryList();