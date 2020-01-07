const express = require("express");
const mysql = require("mysql");
const multer = require("multer");

const { getConnectionFromPool, executeSelectQuery } = require("./dbService");
const {
	handleDBconnectionError,
	handleQueryError,
} = require("./errorHandlers");

const router = express.Router();
const upload = multer();

let pool = mysql.createPool({
	connectionLimit: 5,
	host: "localhost",
	user: "root",
	password: "1234",
});

router.get("/", (req, res) => {
	res.render("main");
});

router.post("/execute_query", upload.none(), async (req, res) => {
	const { queryText } = req.body;

	let connection = null;

	if (queryText) {
		try {
			connection = await getConnectionFromPool(pool);

			try {
				const results = await executeSelectQuery(connection, queryText);

				res.render("main", { results: JSON.stringify(results) });
			} catch (error) {
				handleQueryError(error, res);
			}
		} catch (error) {
			handleDBconnectionError(error, res);
		} finally {
			if (connection) {
				connection.release();
			}
		}
	} else {
		res.redirect(302, "/");
	}
});

module.exports = {
	router,
};
