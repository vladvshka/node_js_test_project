import express from "express";
import multer from "multer";
import assert from "assert";

import {
	getFullUrl,
	makeRequest,
	getOptions,
	validateFormData,
} from "./utils/networkHelpers";
import { formHistoryList, logLine } from "./utils/helpers";
import { dbService } from "./dbService";

const upload = multer();
const router = express.Router();

router.get("/", async (req, res) => {
	const history = await dbService.getAllRequests();
	const historyList = formHistoryList(history);

	res.render("main", { historyList });
});

router.post("/fetch", upload.none(), async (req, res) => {
	try {
		validateFormData(req.body);

		const fullUrl = getFullUrl(req.body);
		const options = getOptions(req.body);

		const response = await makeRequest(fullUrl, options);

		const history = await dbService.getAllRequests();
		const historyList = formHistoryList(history);

		await dbService.saveRequest(fullUrl, options);

		res.render("main", { response, historyList });
	} catch (error) {
		if (error instanceof assert.AssertionError) {
			res.status(400).render("main", { error: error.message });
		} else {
			res.status(500).send(JSON.stringify(error));
		}
	}
});

router.post("/repeat/:requestId", async (req, res) => {
	const { requestId } = req.params;

	const requestRecord = await dbService.getRequestById(requestId);

	const fullUrl = new URL(JSON.parse(requestRecord.url));
	const options = JSON.parse(requestRecord.options);

	const response = await makeRequest(fullUrl, options);
	const history = await dbService.getAllRequests();
	const historyList = formHistoryList(history);

	res.render("main", { response, historyList });
});

// Wrong URLs' handler
router.get("*", (req, res) => {
	res.status(404).send("Sorry, such page doesn't exist!");
});

export { router };
