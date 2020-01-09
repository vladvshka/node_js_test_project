const getConnectionFromPool = pool => {
	return new Promise((resolve, reject) => {
		pool.getConnection((err, connection) => {
			if (err) {
				reject(err); // not connected!
			}
			resolve(connection);
		});
	});
};

const executeQuery = (connection, queryText) => {
	return new Promise((resolve, reject) => {
		connection.query(queryText, (err, results, fields) => {
			if (err) {
				reject(err); // failed request
			}
			resolve(results);
		});
	});
};

const changeDbName = (connection, dbName) => {
	return new Promise((resolve, reject) => {
		connection.changeUser({ database: dbName }, err => {
			if (err) {
				reject(err); // failed request
			}
			resolve(true);
		});
	});
};

const utilQueries = {
	getDatabases: "SHOW DATABASES;",
};

module.exports = {
	getConnectionFromPool,
	executeQuery,
	utilQueries,
	changeDbName,
};
