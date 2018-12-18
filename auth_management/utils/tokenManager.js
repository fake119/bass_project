const uuidv1 = require('uuid/v1'); // time base
const uuidv4 = require('uuid/v4'); // random base

var tokenManager = {
	generateAccessToken : function() {return uuidv1()},
	generateRefreshToken : function() {return uuidv4()},
	generateAuthorizationCode : generateAuthorizationCode
}

function generateAuthorizationCode() {
	return 'xxxxyxxxxy'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

function generateGUID() {
	return 'xxxxyxxxxyxxxxyxxxxyxxxxyxxxxy'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

module.exports = tokenManager;

