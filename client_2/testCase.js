const uuidv1 = require('uuid/v1'); // time base
const uuidv3 = require('uuid/v3'); // nsmespace base
const uuidv4 = require('uuid/v4'); // random base
const uuidv5 = require('uuid/v5'); // random base

console.log('uuidv1 :: ', uuidv1());
console.log('uuidv3 :: ', uuidv3('http://aaa.bbb.com', uuidv3.URL));
console.log('uuidv4 :: ', uuidv4());

const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
console.log('uuidv5 :: ', uuidv5('가나다라마바사', MY_NAMESPACE));


console.log('b8dd4265-7282-4e3b-b2c0-1caeced3db67'.replace(/-/ig, ''));


function generateGUID() {
	return 'xxxxyxxxxyxxxxyxxxxyxxxxyxxxxy'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

console.log(generateGUID());
