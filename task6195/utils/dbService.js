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

const executeSelectQuery = (connection, queryText) => {
	return new Promise((resolve, reject) => {
		connection.query(queryText, (err, results, fields) => {
			if (err) {
				reject(err); // failed request
			}
			resolve(results);
		});
	});
};

module.exports = {
	getConnectionFromPool,
	executeSelectQuery,
};
