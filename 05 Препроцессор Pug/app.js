const express = require('express');
const app = express();

// public - папка где хранится статика
app.use(express.static('public'));

// задаем шаблонизатор pug
app.set('view engine', 'pug');

app.listen(3000, () => {
  console.log('/');
  console.log('node expres work on 3000');
});

app.get('/', (req, res) => {
  res.render('main', {
    foo: 4,
    bar: 7,
  });
});

app.get('/cat', (req, res) => {
  res.end('cat');
});
