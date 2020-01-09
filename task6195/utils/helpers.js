const logLine = (...args) => {
	console.log(...args);
	console.log("========================");
};

const parseQueryText = query => {
	if (!query.endsWith(";")) {
		return (query += ";");
	}
	return query;
};

module.exports = {
	logLine,
	parseQueryText,
};
