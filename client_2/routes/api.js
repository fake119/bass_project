var express = require('express');
var router = express.Router();
let jwt = require("jsonwebtoken");

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: 'Client 2 :: JWT' });
});

/**
 * 	<p>client_id : 55d35bd0-e89b-11e8-9451-f3212dbf199f</p>
	<p>client_secret : b8dd4265-7282-4e3b-b2c0-1caeced3db67</p>
 */
router.get('/getJWT', function (req, res, next) {
	var apiKey = req.query.apiKey;//"55d35bd0-e89b-11e8-9451-f3212dbf199f";
	var sharedSecret = "b8dd4265-7282-4e3b-b2c0-1caeced3db67";
	// var sharedSecret = "b8dd4265-7282-4e3b-b2c0-1caeced3db60"; // fake secret
	var user_data = req.query.user_data;

	var payload = {};
	// Registered Claim Names
	// payload.iat = Date.now();
	// var exp = 5 * 60 * 1000;// = unit * milli * second
	// payload.exp = payload.iat + exp;
	
	payload.jti = "ID_" + Date.now();

	// Private Claim Names
	// payload.apiKey = apiKey;
	if (user_data) {
		payload.user_data = user_data;
	}
	// A JSON numeric value representing the number of seconds from 1970-01-01T00:00:00Z UTC until the specified UTC date/time, ignoring leap seconds.
	// iat, exp는 sencode까지만 표시 millisecond 표시하지 않음.(1542606950 = O, 1542606863221 = X)
	var option = {};
	option.expiresIn = '1m'; // 1 minute // iat랑 쌍으로 자동 설정됨.
	let token = jwt.sign(payload, sharedSecret, option);
	console.log('token', token);
	res.send(token);
});

module.exports = router;
