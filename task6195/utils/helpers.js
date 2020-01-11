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

module.exports = {
	logLine,
	parseQueryText,
};
