var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Client 1 :: OAuth 2.0' });
});

module.exports = router;
