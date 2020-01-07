const { logLine } = require("./helpers");

const handleDBconnectionError = (err, res) => {
	logLine(err);
	res.sendStatus(500);
};

const handleQueryError = (err, res) => {
	logLine(err);
	res.sendStatus(400);
};

module.exports = {
	handleDBconnectionError,
	handleQueryError,
};
