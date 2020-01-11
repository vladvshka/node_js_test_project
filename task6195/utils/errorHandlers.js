const { logLine } = require("./helpers");

const handleDBconnectionError = (err, res) => {
	logLine(err);
	res.status(500).send("Internal server error.");
};

const handleQueryError = (err, databases, res) => {
	logLine(err);

	res.render("main", {
		databases,
		error: `${err.code}: ${err.sqlMessage}`,
	});
};

module.exports = {
	handleDBconnectionError,
	handleQueryError,
};
