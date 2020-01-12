const logLine = (...args) => {
	console.log(...args);
	console.log("========================");
};

const parseQueryText = query => {
	let clearQuery = query
		.replace("\t", "")
		.replace("\r\n", "")
		.replace("\n", "");

	if (!clearQuery.endsWith(";")) {
		return (clearQuery += ";");
	}
	return clearQuery;
};

const parseResults = (isInTables, results) => {
	if (!isInTables || results.length === 0) {
		return JSON.stringify(results, null, 3);
	}
	const headers = Object.keys(results[0]);
	const resultRows = results.map(row => Object.values(row));

	return {
		headers,
		resultRows,
	};
};

module.exports = {
	logLine,
	parseQueryText,
	parseResults,
};
