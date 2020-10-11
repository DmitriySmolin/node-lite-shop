const express = require('express');
const app = express();

// public - папка где хранится статика

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('node expres work on 3000');
});

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/cat', (req, res) => {
  res.end('cat');
});
