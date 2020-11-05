module.exports = (req, res, con, next) => {
  console.log(req.cookies);
  // res.end('work');

  if (!req.cookies.hash || !req.cookies.id) {
    res.redirect('/login');
    return false;
  }

  con.query(`SELECT * FROM user WHERE id="${req.cookies.id}" and hash="${req.cookies.hash}"`, (err, result) => {
    if (err) throw err;

    if (result.length == 0) {
      console.log('error user not found');
      res.redirect('/login');
    } else {
      next();
    }
  });
};
