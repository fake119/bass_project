var express = require('express');
var router = express.Router();
var tokenManager = require('../utils/tokenManager');
var dbManager = require('../utils/dbManager');
let jwt = require("jsonwebtoken");

/* GET home page. */
router.get('/me', function (req, res, next) {
	var authorization = req.headers.authorization;
	if (authorization == null || authorization == undefined || authorization == '') {
		var error = {};
		error.error = "invalid_request";
		error.error_description = "token is empty";

		// res.send(JSON.stringify(error));
		res.send(error);
		res.end();
		return;
	}

	var access_token = authorization.split(' ')[1];
	dbManager.getMe(access_token, (me) => {
		if (me == null) {
			var error = {};
			error.error = "invalid_request";
			error.error_description = "token is invalid.";
	
			res.send(error);
		} else {
			res.send(me);
		}
	});
});

/**
provide transaction list via JWT
 */
router.post('/listTransaction', function (req, res) {
	var authorization = req.headers.authorization;
	if (authorization == null || authorization == undefined || authorization == '') {
		var error = {};
		error.error = "invalid_request";
		error.error_description = "token is empty";

		// res.send(JSON.stringify(error));
		res.send(error);
		res.end();
		return;
	}

	var apiKey = authorization.split('=')[1];
	dbManager.getClient(apiKey, (client) => {
		if (client == null) {
			var error = {};
			error.error = "invalid_request";
			error.error_description = "apiKey is invalid.";
	
			res.send(error);
			res.end();
			return;
		}

		var jwtValue = req.body.jwt;

		if (jwtValue == null || jwtValue == undefined || jwtValue == '') {
			var error = {};
			error.error = "invalid_request";
			error.error_description = "jwt is empty.";
	
			res.send(error);
			res.end();
			return;
		}
	
		var sharedSecret = client.client_secret;
	
		jwt.verify(jwtValue, sharedSecret, (err, decoded) => {
			if (err) {
				var error = {};
				error.error = err.name;
				error.error_description = err.message;
		
				res.send(error);
				res.end();
				return;
			}

			console.log('decoded :: ', decoded);

			var l = [];
			for (var i = 0; i < 3; i++) {
				var map = {};
				map.title = "code " + i;
				map.price = 300 * i;
				
				l.push(map);
			}
			res.send(l);
		});
	});
});

module.exports = router;


