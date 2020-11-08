"use strict";

var express = require('express');

var app = express();

var mysql = require('mysql');

var nodemailer = require('nodemailer');

var cookieParser = require('cookie-parser');

var admin = require('./admin'); // public - папка где хранится статика


app.use(express["static"]('public'));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser()); // задаем шаблонизатор pug

app.set('view engine', 'pug');
var con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lite_shop'
});
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; // con.connect((err) => {
//   if (err) throw err;
//   console.log('Connected');
// });

app.listen(3000, function () {
  console.log('node expres work on 3000');
});
app.use(function (req, res, next) {
  if (req.originalUrl === '/admin' || req.originalUrl === '/admin-order') {
    admin(req, res, con, next);
  } else {
    next();
  }
});
app.get('/', function (req, res) {
  var goods = new Promise(function (resolve, reject) {
    con.query("SELECT id,slug,name, cost, image, category \n       FROM (select id,slug,name,cost,image,category, \n       if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) \n       as ind   \n       FROM goods, ( SELECT @curr_category := '' ) v ) goods WHERE ind < 3", function (err, result) {
      if (err) return reject(err);
      resolve(result);
    });
  });
  var catDescription = new Promise(function (resolve, reject) {
    con.query('SELECT * FROM category', function (err, result) {
      if (err) return reject(err);
      resolve(result);
    });
  });
  Promise.all([goods, catDescription]).then(function (data) {
    console.log(data);
    res.render('index', {
      goods: JSON.parse(JSON.stringify(data[0])),
      catDescription: JSON.parse(JSON.stringify(data[1]))
    });
  });
});
app.get('/cat', function (req, res) {
  // console.log(req.query.id);
  var catId = req.query.id;
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
app.get('/goods/*', function (req, res) {
  // console.log(req.params);
  // const catId = req.query.id;
  // console.log(catId);
  con.query("SELECT * FROM goods WHERE slug=\"".concat(req.params['0'], "\""), function (err, result, field) {
    if (err) throw err;
    result = JSON.parse(JSON.stringify(result));
    var goodsId = result[0]['id'];
    con.query("SELECT * FROM images WHERE goods_id=".concat(goodsId), function (err, goodsImages, field) {
      if (err) throw err;
      console.log(goodsImages);
      goodsImages = JSON.parse(JSON.stringify(goodsImages));
      res.render('goods', {
        goods: result,
        goods_images: goodsImages
      });
    });
  });
});
app.get('/order', function (req, res) {
  res.render('order');
});
app.post('/get-category-list', function (req, res) {
  con.query("SELECT id,category FROM category", function (err, result, field) {
    if (err) throw err;
    res.json(result);
  });
});
app.post('/get-goods-info', function (req, res) {
  // console.log(req.body);
  if (req.body.key.length !== 0) {
    con.query("SELECT id,name,cost FROM goods WHERE ID IN(".concat(req.body.key.join(','), ")"), function (err, result, field) {
      // console.log(result);
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

var sendMail = function sendMail(data, result) {
  var res, total, testAccount, transporter, mailOption, info;
  return regeneratorRuntime.async(function sendMail$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          res = "<h2>Order in lite shop</h2>";
          total = 0;
          Object.values(result).forEach(function (item) {
            res += "<p>".concat(item.name, " - ").concat(data.key[item.id], " - ").concat(item.cost * data.key[item.id], " RUB </p>");
            total += item.cost * data.key[item.id];
          });
          res += '<hr>';
          res += "Total: ".concat(total, " RUB");
          res += "<hr>Phone: ".concat(data.phone, "\n          <hr>Username: ").concat(data.username, "\n          <hr>Address: ").concat(data.address, "\n          <hr>Email: ").concat(data.email);
          _context.next = 8;
          return regeneratorRuntime.awrap(nodemailer.createTestAccount());

        case 8:
          testAccount = _context.sent;
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            // true for 465, false for other ports
            auth: {
              user: testAccount.user,
              // generated ethereal user
              pass: testAccount.pass // generated ethereal password

            }
          });
          mailOption = {
            from: '<neox56@gmail.com>',
            to: "honorum2000@gmail.com,".concat(data.email),
            subject: 'Lite shop order',
            text: 'Hello world',
            html: res
          };
          _context.next = 13;
          return regeneratorRuntime.awrap(transporter.sendMail(mailOption));

        case 13:
          info = _context.sent;
          console.log('Message sent: %s', info.messageId);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          return _context.abrupt("return", true);

        case 17:
        case "end":
          return _context.stop();
      }
    }
  });
};

var saveOrder = function saveOrder(data, result) {
  //data - информация, которую ввел пользователь в форму заказа
  //result - сведения о товаре
  // console.log(data);
  var sql = "INSERT INTO user_info (user_name, user_phone, user_email, address)\n         VALUES(\"".concat(data.username, "\",\"").concat(data.phone, "\",\"").concat(data.email, "\",\"").concat(data.address, "\")");
  con.query(sql, function (err, resultQuery) {
    if (err) throw err; // console.log('1 user info saved');
    // console.log(result);
    // console.log(result.insertId);

    var userId = resultQuery.insertId;
    date = new Date() / 1000;
    Object.values(result).forEach(function (item) {
      sql = "INSERT INTO shop_order (user_id, goods_id, goods_cost, goods_amount,total,date)\n      VALUES(\"".concat(userId, "\",\"").concat(item.id, "\",\"").concat(item.cost, "\",\"").concat(data.key[item.id], "\",\n      \"").concat(item.cost * data.key[item.id], "\",\"").concat(date, "\")");
      con.query(sql, function (err, resultQuery) {
        if (err) throw err;
        console.log('1 goods saved');
      });
    });
  });
};

app.post('/finish-order', function (req, res) {
  if (Object.keys(req.body.key).length !== 0) {
    var key = Object.keys(req.body.key);
    con.query("SELECT id,name,cost FROM goods WHERE ID IN(".concat(key.join(''), ")"), function (err, result, field) {
      if (err) throw err; // console.log(result);

      sendMail(req.body, result)["catch"](console.error());
      saveOrder(req.body, result);
      res.send('1');
    });
  } else {
    res.send('0');
  }
});
app.get('/admin', function (req, res) {
  res.render('admin', {});
});
app.get('/admin-order', function (req, res) {
  con.query("SELECT \n      shop_order.id as id,\n      shop_order.user_id as user_id,\n      shop_order.goods_id as goods_id,\n      shop_order.goods_cost AS goods_cost,\n      shop_order.goods_amount AS goods_amount,\n      shop_order.total as total,\n      from_unixtime(date,\"%Y-%m-%d %h:%m\") as human_date,\n      user_info.user_name as user,\n      user_info.user_phone as phone,\n      user_info.user_email as email,\n      user_info.address as address\n      FROM \n        shop_order\n      LEFT JOIN\n        user_info\n      ON\n      shop_order.user_id = user_info.id ORDER BY date DESC", function (err, result, field) {
    if (err) throw err; // console.log(result);

    res.render('admin-order', {
      order: JSON.parse(JSON.stringify(result))
    });
  });
});
/*login form */

app.get('/login', function (req, res) {
  res.render('login', {});
});
app.post('/login', function (req, res) {
  // console.log(req.body);
  con.query("SELECT * FROM user WHERE login=\"".concat(req.body.login, "\" and password=\"").concat(req.body.password, "\""), function (err, result) {
    if (err) throw err;

    if (result.length === 0) {
      console.log('error user not found');
      res.redirect('/login');
    } else {
      result = JSON.parse(JSON.stringify(result));
      var userId = result[0].id;
      var hash = makeHash(32);
      res.cookie('hash', hash);
      res.cookie('id', userId); // запись hash в базу данных

      con.query("UPDATE user SET hash='".concat(hash, "' WHERE id=").concat(userId), function (err, resultQuery) {
        if (err) throw err;
        res.redirect('/admin');
      });
    }
  });
});

function makeHash(length) {
  return Math.random().toString(length).substring(2, 15) + Math.random().toString(length).substring(2, 15);
}