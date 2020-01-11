const express = require("express");
const mysql = require("mysql");
const multer = require("multer");

const { logLine, parseQueryText } = require("./helpers");
const {
	getConnectionFromPool,
	executeQuery,
	utilQueries,
	changeDbName,
} = require("./dbService");
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

const getAllDatabases = async res => {
	let connection = null;

	try {
		connection = await getConnectionFromPool(pool);

		try {
			const results = await executeQuery(connection, utilQueries.getDatabases);
			const databasesList = results.map(db => db.Database);

			return databasesList;
		} catch (error) {
			handleQueryError(error, res);
			return null;
		}
	} catch (error) {
		handleDBconnectionError(error, res);
		return null;
	} finally {
		if (connection) {
			connection.release();
		}
	}
};

router.get("/", async (req, res) => {
	try {
		const results = await getAllDatabases(res);

		if (results) {
			res.render("main", { databases: results });
		}
	} catch (error) {
		handleDBconnectionError(error, res);
	}
});

router.post("/execute_query", upload.none(), async (req, res) => {
	let { queryText } = req.body;
	const { dataBase } = req.body;
	logLine("queryText", queryText);
	logLine("dataBase", dataBase);

	let connection = null;

	if (queryText) {
		try {
			connection = await getConnectionFromPool(pool);

			try {
				if (dataBase) {
					await changeDbName(connection, dataBase);
				}

				const clearedQuery = parseQueryText(queryText);

				let results = await executeQuery(connection, clearedQuery);

				if (results.affectedRows && results.affectedRows > 0) {
					results = { affectedRows: results.affectedRows };
				}

				const databases = await getAllDatabases(res);

				res.render("main", {
					results: JSON.stringify(results),
					databases,
					selectedDb: dataBase,
					request: clearedQuery,
				});
			} catch (error) {
				const databases = await getAllDatabases(res);

				handleQueryError(error, databases, res);
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

// Wrong URLs' handler
router.get("*", (req, res) => {
	res.status(404).send("Sorry, such page doesn't exist!");
});

module.exports = {
	router,
};
