const mariadb = require("mariadb");

const pool = mariadb.createPool({
	host: "localhost",
	user: "root",
	password: "1234",
	connectionLimit: 5,
	database: "test",
});

(async function asyncFunction() {
	let conn;
	try {
		conn = await pool.getConnection();
		const rows = await conn.query("SHOW DATABASES;");
		console.log(rows); //[ {val: 1}, meta: ... ]
	} catch (err) {
		console.log("err", err);
		throw err;
	} finally {
		if (conn) return conn.end();
	}
})();
