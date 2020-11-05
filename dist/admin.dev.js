"use strict";

module.exports = function (req, res, con, next) {
  console.log(req.cookies); // res.end('work');

  if (!req.cookies.hash || !req.cookies.id) {
    res.redirect('/login');
    return false;
  }

  con.query("SELECT * FROM user WHERE id=\"".concat(req.cookies.id, "\" and hash=\"").concat(req.cookies.hash, "\""), function (err, result) {
    if (err) throw err;

    if (result.length == 0) {
      console.log('error user not found');
      res.redirect('/login');
    } else {
      next();
    }
  });
};