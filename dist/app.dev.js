"use strict";

var express = require('express');

var app = express();

var mysql = require('mysql');

var nodemailer = require('nodemailer'); // public - папка где хранится статика


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
  var goods = new Promise(function (resolve, reject) {
    con.query("select id,name, cost, image, category \n    from (select id,name,cost,image,category, \n    if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) \n    as ind   \n    from goods, ( select @curr_category := '' ) v ) goods where ind < 3", function (err, result) {
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

app.post('/finish-order', function (req, res) {
  if (Object.keys(req.body.key).length !== 0) {
    var key = Object.keys(req.body.key);
    con.query("SELECT id,name,cost FROM goods WHERE ID IN(".concat(key.join(''), ")"), function (err, result, field) {
      if (err) throw err; // console.log(result);

      sendMail(req.body, result)["catch"](console.error());
      res.send('1');
    });
  } else {
    res.send('0');
  }
});