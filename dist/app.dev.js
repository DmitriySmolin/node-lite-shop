"use strict";

var express = require('express');

var app = express();

var mysql = require('mysql'); // public - папка где хранится статика


app.use(express["static"]('public'));
app.use(express.json()); // задаем шаблонизатор pug

app.set('view engine', 'pug');
var con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lite_shop'
}); // con.connect((err) => {
//   if (err) throw err;
//   console.log('Connected');
// });

app.listen(3000, function () {
  console.log('node expres work on 3000');
});
app.get('/', function (req, res) {
  con.query('SELECT * FROM goods', function (err, result) {
    if (err) throw err; // console.log(result);

    var goods = {};

    for (var i = 0; i < result.length; i++) {
      goods[result[i]['id']] = result[i];
    } // console.log(goods);
    //console.log(JSON.parse(JSON.stringify(goods)));


    res.render('main', {
      foo: 'hello',
      bar: 7,
      goods: JSON.parse(JSON.stringify(goods))
    });
  });
});
app.get('/cat', function (req, res) {
  // console.log(req.query.id);
  var catId = req.query.id; // res.render('cat', {
  //   cat: '',
  //   goods: '',
  //   foo: 'hello',
  // });

  var cat = new Promise(function (resolve, reject) {
    con.query("SELECT * FROM category WHERE ID=".concat(catId), function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  var goods = new Promise(function (resolve, reject) {
    con.query("SELECT * FROM goods WHERE category=".concat(catId), function (err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
  Promise.all([cat, goods]).then(function (data) {
    // console.log(data);
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(data[0])),
      goods: JSON.parse(JSON.stringify(data[1]))
    });
  });
});
app.get('/goods', function (req, res) {
  var catId = req.query.id; // console.log(catId);

  con.query("SELECT * FROM goods WHERE id=".concat(catId), function (err, result, field) {
    if (err) throw err;
    console.log(result);
    res.render('goods', {
      goods: JSON.parse(JSON.stringify(result))
    });
  });
});
app.post('/get-category-list', function (req, res) {
  con.query("SELECT id,category FROM category", function (err, result, field) {
    if (err) throw err;
    res.json(result);
  });
});
app.post('/get-goods-info', function (req, res) {
  if (req.body.key.length !== 0) {
    con.query("SELECT id,name,cost FROM goods WHERE ID IN(".concat(req.body.key.join(','), ")"), function (err, result, field) {
      if (err) throw err;
      var goods = {};

      for (var i = 0; i < result.length; i++) {
        goods[result[i].id] = result[i];
      } // console.log(goods);


      res.json(goods);
    });
  } else {
    res.send('0');
  }
});