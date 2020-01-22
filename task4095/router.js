import express from "express";
import multer from "multer";

import { getFullUrl, makeRequest, getOptions } from "./utils/networkHelpers";
import { formHistoryList } from "./utils/helpers";
import { dbService } from "./dbService";

const upload = multer();
const router = express.Router();

router.get("/", async (req, res) => {
	const history = await dbService.getAllRequests();
	const historyList = formHistoryList(history);

	res.render("main", { historyList });
});

router.post("/fetch", upload.none(), async (req, res) => {
	// add shared validation on empty!

	const fullUrl = getFullUrl(req.body);
	const options = getOptions(req.body);

	try {
		const response = await makeRequest(fullUrl, options);

		await dbService.saveRequest(fullUrl, options);

		const history = await dbService.getAllRequests();
		const historyList = formHistoryList(history);

		res.render("main", { response, historyList });
	} catch (error) {
		res.status(500).send(JSON.stringify(error));
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
