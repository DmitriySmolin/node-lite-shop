const express = require('express');
const app = express();
const mysql = require('mysql');

// public - папка где хранится статика
app.use(express.static('public'));

// задаем шаблонизатор pug
app.set('view engine', 'pug');

let con = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lite_shop',
});

// con.connect((err) => {
//   if (err) throw err;
//   console.log('Connected');
// });

app.listen(3000, () => {
  console.log('/');
  console.log('node expres work on 3000');
});

app.get('/', (req, res) => {
  con.query('SELECT * FROM goods', (err, result) => {
    if (err) throw err;
    // console.log(result);

    let goods = {};
    for (let i = 0; i < result.length; i++) {
      goods[result[i]['id']] = result[i];
    }

    // console.log(goods);
    //console.log(JSON.parse(JSON.stringify(goods)));

    res.render('main', {
      foo: 'hello',
      bar: 7,
      goods: JSON.parse(JSON.stringify(goods)),
    });
  });
});

app.get('/cat', (req, res) => {
  // console.log(req.query.id);
  const catId = req.query.id;
  res.render('cat', {});

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

  Promise.all([cat, goods]).then((res) => console.log(res[1]));
});
