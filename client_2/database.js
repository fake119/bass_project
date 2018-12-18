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

// Create and insert a data manually.
// const query1 = client.query(
// 	'CREATE TABLE items(id SERIAL PRIMARY KEY, text VARCHAR(40) not null, complete BOOLEAN)', (err, res) => {
// 		console.log(err, res);
// 		client.end();
// 	}
// );

const query1 = client.query(
	'SELECT id, text, complete FROM items', (err, res) => {
		// console.log(err, res);
		res.rows.forEach((e) => {
			console.log('e :: ', e);
		});
		client.end();
	}
);


// module.exports = app;
