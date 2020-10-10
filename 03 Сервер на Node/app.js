const http = require('http');
const fs = require('fs');
// http.createServer().listen(3000);

const server = http.createServer((req, res) => {
  console.log(req.url);
  console.log(req.method);
  console.log(req.headers['user-agent']);

  res.setHeader('Content-Type', 'text/html; charset = utf-8;');

  if (req.url == '/') {
    res.end('Main <b>hello</b>');
  } else if (req.url == '/cat') {
    res.end('Category <h2>hello</h2>');
  } else if (req.url == '/dat') {
    let myFile = fs.readFileSync('1.dat', 'utf-8');
    console.log(myFile);
    res.end(myFile);
  }
});
server.listen(3000);
