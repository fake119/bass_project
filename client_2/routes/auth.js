var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('auth/index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
	res.render('auth/login', { title: 'Express' });
});

/**
Name : callback

## parameters
code				(required)
state				(required)

서버 내의 callback, 사용자가 자체 callback 등록하지 않은 경우 현재 서버의 callback을 사용한다.

ex : http://localhost:2001/auth/callback?code={xyz}&state={a}
 */
router.get('/callback', function (req, res, next) {
	// callback for authorization_code
	var code = req.query.code;
	var state = req.query.state;
	var error = req.query.error;
	var error_description = req.query.error_description;

	// callback for token
	var access_token = req.query.access_token;
	var token_type = req.query.token_type;
	var expires_in = req.query.expires_in;
	var refresh_token = req.query.refresh_token;

	res.render('auth/callback', {
		code : code, state : state, error : error, error_description : error_description,
		access_token : access_token, token_type : token_type, expires_in : expires_in, refresh_token : refresh_token
	});
});

module.exports = router;
