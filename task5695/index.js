const express = require("express");
const progress = require("progress-stream");
const path = require("path");
const multer = require("multer"); // для обработки тел запроса в формате multipart/form-data
const uuidv1 = require("uuid/v1");
const WebSocket = require("ws");

import { KEEP_ALIVE, CONNECTION_ID, PROGRESS } from "./shared/index.js";

const { TaskQueue, updateStorage } = require("./utils/storageHelpers");
const { WebSocketsWatcher } = require("./utils/webSocketsHelpers");

const webserver = express();
const port = 7180;

const wsServer = new WebSocket.Server({ port: 7181 });
const watcher = new WebSocketsWatcher();

wsServer.on("connection", connection => {
	console.log("new connection");
	const connectionId = uuidv1();
	watcher.addClient(connection, connectionId);

	connection.send(JSON.stringify({ [CONNECTION_ID]: connectionId }));

	connection.on("message", message => {
		if (message === KEEP_ALIVE) {
			watcher.updateConnectionTime(connectionId);
		}
	});
});

// define cutom multer storage to keep file extension.
const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "uploads"));
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

// миддлварь для работы с multipart/form-data;
const upload = multer({ storage: multerStorage });

// fieldname === attachment, it must be the name of input type="file"
const attachment = upload.single("attachment");

const taskQueue = new TaskQueue();

webserver.use(express.urlencoded({ extended: true }));
webserver.use(express.static(path.join(__dirname, "public")));
webserver.use("/shared/", express.static(path.resolve(__dirname, "shared")));

// checkStorageConsistency();

// Use progress->multer bundle to handle uploads.
webserver.post("/upload", (req, res) => {
	const bodyProgress = progress();
	const fileLength = +req.headers["content-length"]; // берём длину всего тела запроса

	const connectionId = req.query[CONNECTION_ID];

	if (connectionId) {
		bodyProgress.on("progress", info => {
			const msg = JSON.stringify({ [PROGRESS]: info.transferred / fileLength });

			const connection = watcher.getConnectionById(connectionId);

			if (!!connection) {
				connection.send(msg);
			} else {
				console.log("Error finding connection: ", connectionId);
			}
		});
	}

	// req -> progress -> multer
	req.pipe(bodyProgress);
	bodyProgress.headers = req.headers;

	attachment(bodyProgress, res, err => {
		if (err) {
			res.status(500);
		}

		console.log("body", bodyProgress.body);
		// file contains single "attachment"
		console.log("file", bodyProgress.file);

		const fileId = uuidv1();

		const fileData = {
			fileId,
			comment: bodyProgress.body.comment,
			fileName: bodyProgress.file.filename,
		};

		updateStorage(taskQueue, fileData);

		taskQueue
			.on("done", id => {
				if (id === fileId) {
					console.log("Client's file is uploaded and stored.");
					res.redirect(302, "/main");
				}
			})
			.on("error", id => {
				if (id === fileId) {
					console.log("Client's file saving error.");
					res.redirect(302, "/main");
				}
			});
	});
});

webserver.get("/main", (req, res) => {
	res.setHeader("Content-Type", "text/html");
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

webserver.listen(port, () =>
	console.log(`File uploader listening on port ${port}!`)
);
