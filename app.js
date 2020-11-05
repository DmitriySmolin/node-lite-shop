const express = require('express');
const app = express();
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const admin = require('./admin');
// public - папка где хранится статика
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

// задаем шаблонизатор pug
app.set('view engine', 'pug');

let con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lite_shop',
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// con.connect((err) => {
//   if (err) throw err;
//   console.log('Connected');
// });

app.listen(3000, () => {
  console.log('node expres work on 3000');
});

app.use(function (req, res, next) {
  if (req.originalUrl === '/admin' || req.originalUrl === '/admin-order') {
    admin(req, res, con, next);
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  const goods = new Promise((resolve, reject) => {
    con.query(
      `select id,name, cost, image, category 
    from (select id,name,cost,image,category, 
    if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) 
    as ind   
    from goods, ( select @curr_category := '' ) v ) goods where ind < 3`,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });

  const catDescription = new Promise((resolve, reject) => {
    con.query('SELECT * FROM category', (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });

  Promise.all([goods, catDescription]).then((data) => {
    console.log(data);
    res.render('index', {
      goods: JSON.parse(JSON.stringify(data[0])),
      catDescription: JSON.parse(JSON.stringify(data[1])),
    });
  });
});

app.get('/cat', (req, res) => {
  // console.log(req.query.id);
  const catId = req.query.id;

  let cat = new Promise((resolve, reject) => {
    con.query(`SELECT * FROM category WHERE ID=${catId}`, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  let goods = new Promise((resolve, reject) => {
    con.query(`SELECT * FROM goods WHERE category=${catId}`, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  Promise.all([cat, goods]).then((data) => {
    // console.log(data);
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(data[0])),
      goods: JSON.parse(JSON.stringify(data[1])),
    });
  });
});

app.get('/goods', (req, res) => {
  const catId = req.query.id;
  // console.log(catId);
  con.query(`SELECT * FROM goods WHERE id=${catId}`, (err, result, field) => {
    if (err) throw err;
    console.log(result);
    res.render('goods', {
      goods: JSON.parse(JSON.stringify(result)),
    });
  });
});

app.get('/order', (req, res) => {
  res.render('order');
});

app.post('/get-category-list', (req, res) => {
  con.query(`SELECT id,category FROM category`, (err, result, field) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post('/get-goods-info', (req, res) => {
  if (req.body.key.length !== 0) {
    con.query(`SELECT id,name,cost FROM goods WHERE ID IN(${req.body.key.join(',')})`, (err, result, field) => {
      if (err) throw err;
      let goods = {};
      for (let i = 0; i < result.length; i++) {
        goods[result[i].id] = result[i];
      }
      // console.log(goods);
      res.json(goods);
    });
  } else {
    res.send('0');
  }
});

const sendMail = async (data, result) => {
  let res = `<h2>Order in lite shop</h2>`;
  let total = 0;
  Object.values(result).forEach((item) => {
    res += `<p>${item.name} - ${data.key[item.id]} - ${item.cost * data.key[item.id]} RUB </p>`;
    total += item.cost * data.key[item.id];
  });
  res += '<hr>';
  res += `Total: ${total} RUB`;

  res += `<hr>Phone: ${data.phone}
          <hr>Username: ${data.username}
          <hr>Address: ${data.address}
          <hr>Email: ${data.email}`;

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  let mailOption = {
    from: '<neox56@gmail.com>',
    to: `honorum2000@gmail.com,${data.email}`,
    subject: 'Lite shop order',
    text: 'Hello world',
    html: res,
  };

  let info = await transporter.sendMail(mailOption);

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  return true;
};

const saveOrder = (data, result) => {
  //data - информация, которую ввел пользователь в форму заказа
  //result - сведения о товаре
  // console.log(data);
  let sql = `INSERT INTO user_info (user_name, user_phone, user_email, address)
         VALUES("${data.username}","${data.phone}","${data.email}","${data.address}")`;
  con.query(sql, (err, resultQuery) => {
    if (err) throw err;
    // console.log('1 user info saved');
    // console.log(result);
    // console.log(result.insertId);

    let userId = resultQuery.insertId;

    date = new Date() / 1000;
    Object.values(result).forEach((item) => {
      sql = `INSERT INTO shop_order (user_id, goods_id, goods_cost, goods_amount,total,date)
      VALUES("${userId}","${item.id}","${item.cost}","${data.key[item.id]}",
      "${item.cost * data.key[item.id]}","${date}")`;

      con.query(sql, (err, resultQuery) => {
        if (err) throw err;
        console.log('1 goods saved');
      });
    });
  });
};

app.post('/finish-order', (req, res) => {
  if (Object.keys(req.body.key).length !== 0) {
    const key = Object.keys(req.body.key);
    con.query(`SELECT id,name,cost FROM goods WHERE ID IN(${key.join('')})`, (err, result, field) => {
      if (err) throw err;
      // console.log(result);
      sendMail(req.body, result).catch(console.error());
      saveOrder(req.body, result);
      res.send('1');
    });
  } else {
    res.send('0');
  }
});

app.get('/admin', (req, res) => {
  res.render('admin', {});
});

app.get('/admin-order', (req, res) => {
  con.query(
    `SELECT 
      shop_order.id as id,
      shop_order.user_id as user_id,
      shop_order.goods_id as goods_id,
      shop_order.goods_cost AS goods_cost,
      shop_order.goods_amount AS goods_amount,
      shop_order.total as total,
      from_unixtime(date,"%Y-%m-%d %h:%m") as human_date,
      user_info.user_name as user,
      user_info.user_phone as phone,
      user_info.user_email as email,
      user_info.address as address
      FROM 
        shop_order
      LEFT JOIN
        user_info
      ON
      shop_order.user_id = user_info.id ORDER BY date DESC`,
    (err, result, field) => {
      if (err) throw err;
      console.log(result);
      res.render('admin-order', {
        order: JSON.parse(JSON.stringify(result)),
      });
    }
  );
});

/*login form */
app.get('/login', (req, res) => {
  res.render('login', {});
});

app.post('/login', (req, res) => {
  console.log(req.body);
  con.query(`SELECT * FROM user WHERE login="${req.body.login}" and password="${req.body.password}"`, (err, result) => {
    if (err) throw err;

    if (result.length === 0) {
      console.log('error user not found');
      res.redirect('/login');
    } else {
      result = JSON.parse(JSON.stringify(result));
      let userId = result[0].id;
      let hash = makeHash(32);
      res.cookie('hash', hash);
      res.cookie('id', userId);

      // запись hash в базу данных
      con.query(`UPDATE user SET hash='${hash}' WHERE id=${userId}`, (err, resultQuery) => {
        if (err) throw err;
        res.redirect('/admin');
      });
    }
  });
});

function makeHash(length) {
  return Math.random().toString(length).substring(2, 15) + Math.random().toString(length).substring(2, 15);
}
