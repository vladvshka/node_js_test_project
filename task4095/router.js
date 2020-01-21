const express = require("express");
const multer = require("multer");

const {
	getFullUrl,
	makeRequest,
	getOptions,
} = require("./utils/networkHelpers");
const { logLine } = require("./utils/helpers");

const upload = multer();
const router = express.Router();

router.get("/", (req, res) => res.render("main"));

router.post("/fetch", upload.none(), async (req, res) => {
	logLine("body: ", req.body);
	// add shared validation on empty!

	const fullUrl = getFullUrl(req.body);
	const options = getOptions(req.body);

	try {
		const response = await makeRequest(fullUrl, options);

		res.render("main", { response });
	} catch (error) {
		res.status(500).send(JSON.stringify(error));
	}
});

// Wrong URLs' handler
router.get("*", (req, res) => {
	res.status(404).send("Sorry, such page doesn't exist!");
});

module.exports = {
	router,
};
