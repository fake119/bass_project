var express = require('express');
var router = express.Router();
var tokenManager = require('../utils/tokenManager');
var dbManager = require('../utils/dbManager');
/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('auth/index', { title: 'Express' });
});
/**
http://localhost:3000/auth/authorize?response_type=code&client_id=066c35d0-e89b-11e8-ae3e-0705eab6c106&redirect_uri=http%3A%2F%2Flocalhost%3A2001%2Fauth%2Fcallback
 */
router.post('/login', function (req, res, next) {
	const username = req.body.username;
	const password = req.body.password;
	var user = dbManager.getUser(username, password, function(userInfo) {
		console.log('userInfo', userInfo);
		if (userInfo == null) {
			res.render('auth/authorize', {error : '로그인 실패'});
			res.end();
			return;
		}
	
		let sess = req.session;
		if (sess == undefined) sess = {};
		
		sess.users_seq = userInfo.seq;
		sess.username = userInfo.username;
		req.session = sess;
	
		// console.log('req.session', req.session);
		
		res.render('auth/grant', {sess : sess});
	});
});

router.get('/grantOK', function (req, res, next) {
	// code, state.
	dbManager.getClient(req.session.client_id, (clientInfo) => {
		if (clientInfo == null) {
			res.render('auth/authorize', {error : '인증되지 않은 client 입니다.'});
			res.end();
			return;
		}

		var client_seq = clientInfo.seq;
		var users_seq = req.session.users_seq;
		var code = tokenManager.generateAuthorizationCode();

		dbManager.createUsersClient(users_seq, client_seq, code, ()=>{
			var redirect_uri = req.session.redirect_uri;
			var state = req.session.state;
		
			res.render('auth/grantOK', {code:code, state:state, redirect_uri:redirect_uri});
		});
	});
});

/**
Name : authorize

## parameters
response_type=code	(required)
client_id			(required)
redirect_uri		(optional)
scope				(optional)
state				(recommended)

## returns
code				(required, A maximum authorization code lifetime of 10 minutes is RECOMMENDED)
state				(required, if a "state" parameter was present in the client authorization request. The exact value received from the client.)

ex : http://aaa.bbb.com/auth/authorize?response_type=code&client_id={a}&scope={b}&redirect_uri={c}&state={d}
 */
router.get('/authorize', function (req, res, next) {
	let sess = req.session;
	if (sess == undefined) sess = {};
	
	sess.client_id = req.query.client_id;
	sess.redirect_uri = req.query.redirect_uri;
	sess.state = req.query.state;
	req.session = sess;

	// console.log('req.session', req.session);
	
	// parameter check.
	res.render('auth/authorize', {error:''});
});

/**
Name : callback

## parameters
code				(required)
state				(required)

서버 내의 callback, 사용자가 자체 callback 등록하지 않은 경우 현재 서버의 callback을 사용한다.

ex : http://aaa.bbb.com/auth/callback?code={xyz}&state={a}
 */
router.get('/callback', function (req, res, next) {
	res.render('auth/callback', {});
});

/**
Name : token

토큰 발급

## parameters
grant_type=authorization_code	(required)
code							(required)
redirect_uri					(required)
client_id						(required)

## returns
access_token					(required)
token_type						(required)		bearer
expires_in						(recommended)
refresh_token					(optional)
scope							(optional)

Server -> Server redirect
ex : http://aaa.bbb.com/auth/token?grant_type=authorization_code&code={a}&redirect_uri={b}&client_id={c}&client_secret={d}
 */
router.get('/token', function (req, res, next) {
	var grant_type = req.query.grant_type;
	var code = req.query.code;
	var redirect_uri = req.query.redirect_uri;
	var client_id = req.query.client_id;
	
	dbManager.validateCode(code, redirect_uri, client_id, (userClient) => {
		var isError = false;
		
		if (userClient == null) isError = true;

		var params = {};
		if (isError) {
			var error = "access_denied";
			var error_description = "code is invalid or expired or not match with client_id.";
			
			params.isError = isError;
			params.error = error;
			params.error_description = error_description;
			params.redirect_uri = redirect_uri;

			res.render('auth/token', params);
		} else { // error
			var access_token = tokenManager.generateAccessToken();//uuidv1();//"8c7ac3d0-e963-11e8-8a4d-db409abf988d";
			var token_type = "bearer";
			var expires_in = 3600;
			var refresh_token = tokenManager.generateRefreshToken();//uuidv4();//"90268dc0-e963-11e8-853e-336048aff910";
			
			params.isError = isError;
			params.access_token = access_token;
			params.token_type = token_type;
			params.expires_in = expires_in;
			params.refresh_token = refresh_token;
			params.redirect_uri = redirect_uri;

			dbManager.updateUsersClient(
				userClient.seq,
				token_type,
				access_token,
				refresh_token,
				expires_in,
				(updatesInfo) => {
					res.render('auth/token', params);
				}
			);
		}
	});
});

/**
Name : refresh

토큰 발급

## parameters
grant_type=refresh_token		(required)
refresh_token					(required)
scope							(optional)

## returns
access_token					(required)
token_type						(required)		bearer
expires_in						(recommended)
refresh_token					(optional)
scope							(optional)

Server -> Server redirect
ex : http://aaa.bbb.com/auth/refresh?grant_type=refresh_token&refresh_token={a}
 */
router.get('/refresh', function (req, res, next) {
	res.render('auth/refresh', {});
});

/**
 https://tools.ietf.org/html/rfc6749
 
error
a single ASCII error code from the following list:

invalid_request – the request is missing a parameter, contains an invalid parameter, includes a parameter more than once, or is otherwise invalid.
access_denied – the user or authorization server denied the request
unauthorized_client – the client is not allowed to request an authorization code using this method, for example if a confidential client attempts to use the implicit grant type.
unsupported_response_type – the server does not support obtaining an authorization code using this method, for example if the authorization server never implemented the implicit grant type.
invalid_scope – the requested scope is invalid or unknown.
server_error – instead of displaying a 500 Internal Server Error page to the user, the server can redirect with this error code.
temporarily_unavailable – if the server is undergoing maintenance, or is otherwise unavailable, this error code can be returned instead of responding with a 503 Service Unavailable status code.

error_description
The authorization server can optionally include a human-readable description of the error. This parameter is intended for the developer to understand the error, and is not meant to be displayed to the end user. The valid characters for this parameter are the ASCII character set except for the double quote and backslash, specifically, hex codes 20-21, 23-5B and 5D-7E.

 */
module.exports = router;


