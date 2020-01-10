const { logLine } = require("./helpers");

const handleDBconnectionError = (err, res) => {
	logLine(err);
	res.status(500).send("Internal server error.");
};

const handleQueryError = (err, databases, res) => {
	logLine(err);

	res.render("main", {
		databases,
		error: "400: Bad request!",
	});
};

module.exports = {
	handleDBconnectionError,
	handleQueryError,
};
