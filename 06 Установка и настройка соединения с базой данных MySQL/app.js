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
  database: 'testdb',
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
  con.query('SELECT * FROM one', (err, result) => {
    if (err) throw err;
    console.log(result);
  });
  res.render('main', {
    foo: 'hello',
    bar: 7,
  });
});
