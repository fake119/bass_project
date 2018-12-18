const pg = require('pg');
// const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/sea';

var config = {
	user: 'bass', //env var: PGUSER
	database: 'bass', //env var: PGDATABASE
	password: 'bass', //env var: PGPASSWORD
	host: 'localhost', // Server hosting the postgres database
	port: 5432, //env var: PGPORT
	max: 10, // max number of clients in the pool
	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

const client = new pg.Client(config);
client.connect();

/**
 * 사용자 정보 조회
 */
async function getUser(username, password, callback) {
	const res = await client.query(
		'SELECT seq, name, username, password, is_active FROM users WHERE username = $1 AND password = $2', 
		[username, password]
	);

	console.log(res.rows[0]); // Hello world!
	// await client.end();
	// console.log('res', res);
	if (res == null || res.rows.length <= 0 ) callback(null);
	callback(res.rows[0]);
}

async function getClient(client_id, callback) {
	const res = await client.query (
		'SELECT seq, name, client_id, client_secret FROM client WHERE client_id = $1', 
		[client_id]
	);

	console.log(res.rows[0]); // Hello world!
	// await client.end();
	// console.log('res', res);
	if (res == null || res.rows.length <= 0 ) callback(null);
	callback(res.rows[0]);
}

async function createUsersClient(users_seq, client_seq, code, callback) {
	const res = await client.query(
		"INSERT INTO users_client (users_seq, client_seq, authorization_code) VALUES ($1, $2, $3) RETURNING seq", 
		[users_seq, client_seq, code]
	);

	console.log(res.rows[0]); // Hello world!
	// await client.end();
	// console.log('res', res);
	if (res == null || res.rows.length <= 0 ) callback(null);
	callback(res.rows[0]);
}

async function validateCode(code, redirect_uri, client_id, callback) {
	var query = '';
	query += 'select ';
	query += '	a.seq, users_seq, a.client_seq, authorization_code, token_type, ';
	query += '	a.access_token, a.refresh_token, a.expires_in, ';
	query += '	b.name, b.username, ';
	query += '	c.name, c.client_id, c.redirect_uri ';
	query += 'from  ';
	query += '	users_client a, ';
	query += '	users b, ';
	query += '	client c ';
	query += 'where ';
	query += '	a.users_seq = b.seq ';
	query += '	and a.client_seq = c.seq ';
	query += '	and a.authorization_code = $1';
	query += '	and c.redirect_uri = $2';
	query += '	and c.client_id = $3';
	
	const res = await client.query (
		query, 
		[code, redirect_uri, client_id]
	);

	console.log(res.rows[0]); // Hello world!
	// await client.end();
	// console.log('res', res);
	if (res == null || res.rows.length <= 0 ) callback(null);
	callback(res.rows[0]);
}

async function updateUsersClient(seq, token_type, access_token, refresh_token, expires_in, callback) {
	var query = '';
	query += 'UPDATE users_client SET  ';
	query += '	token_type = $2,  ';
	query += '	access_token = $3,  ';
	query += '	refresh_token = $4,  ';
	query += '	expires_in = $5 ';
	query += 'WHERE seq =  $1';
	query += '	RETURNING seq'
	const res = await client.query(
		query, 
		[seq, token_type, access_token, refresh_token, expires_in]
	);

	console.log(res.rows[0]); // Hello world!
	// await client.end();
	// console.log('res', res);
	if (res == null || res.rows.length <= 0 ) callback(null);
	callback(res.rows[0]);
}

async function getMe(access_token, callback) {
	var query = '';
	query += 'select ';
	query += '	a.seq, users_seq, a.client_seq, authorization_code, token_type, ';
	query += '	a.access_token, a.refresh_token, a.expires_in, ';
	query += '	b.name as my_name, b.username, ';
	query += '	c.name, c.client_id, c.redirect_uri ';
	query += 'from  ';
	query += '	users_client a, ';
	query += '	users b, ';
	query += '	client c ';
	query += 'where ';
	query += '	a.users_seq = b.seq ';
	query += '	and a.client_seq = c.seq ';
	query += '	and a.access_token = $1'
	
	const res = await client.query (
		query, 
		[access_token]
	);

	console.log(res.rows[0]); // Hello world!
	// await client.end();
	// console.log('res', res);
	if (res == null || res.rows.length <= 0 ) callback(null);
	callback(res.rows[0]);
}

var dbManager = {
	getUser : getUser,
	getClient : getClient,
	validateCode : validateCode,
	updateUsersClient : updateUsersClient,
	getMe : getMe,
	createUsersClient : createUsersClient
}

module.exports = dbManager;

