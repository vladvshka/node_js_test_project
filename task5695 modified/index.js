const express = require("express");
const progress = require("progress-stream");
const path = require("path");
const multer = require("multer"); // для обработки тел запроса в формате multipart/form-data
const uuidv1 = require("uuid/v1");
const WebSocket = require("ws");
const fsp = require("fs").promises;

import { CONNECTION_ID, PROGRESS, logLine } from "./shared/index.js";
import { WebSocketsWatcher } from "./utils/webSocketsHelpers";

const { TaskQueue, updateStorage } = require("./utils/storageHelpers");

const webserver = express();
const port = 7180;

const wsServer = new WebSocket.Server({ port: 7181 });
const WsWatcher = new WebSocketsWatcher();
// This object manages writing to storage.json
const taskQueue = new TaskQueue();

/**
 * Every new client sends an ID. The connection is stored and handled by WebSocketsWatcher.
 */
wsServer.on("connection", connection => {
	logLine("new client connected");

	connection.on("message", message => {
		logLine("message", message);

		const data = JSON.parse(message);

		if (data[CONNECTION_ID]) {
			const connectionId = data[CONNECTION_ID];
			logLine("connectionId from client: ", connectionId);

			WsWatcher.addClient(connection, connectionId);
		}
	});
});

// define cutom multer storage and filename.
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

webserver.use(express.urlencoded({ extended: true }));
webserver.use(express.static(path.join(__dirname, "public")));
webserver.use("/shared/", express.static(path.resolve(__dirname, "shared")));
// view engine setup
webserver.set("view engine", "pug"); // устанавливаем, что будет использоваться именно движок шаблонов pug
webserver.set("views", path.join(__dirname, "views")); // задаём папку, в которой будут шаблоны

// Use progress->multer bundle to handle uploads.
webserver.post("/upload", (req, res) => {
	const bodyProgress = progress();
	const fileLength = +req.headers["content-length"]; // берём длину всего тела запроса

	let connection = null;
	const connectionId = req.query[CONNECTION_ID];

	if (!connectionId) {
		res
			.status(400)
			.send("Request headers are incomplete. CONNECTION_ID is missing.");
	}

	bodyProgress.on("progress", info => {
		const msg = JSON.stringify({ [PROGRESS]: info.transferred / fileLength });

		connection = WsWatcher.getConnectionById(connectionId);

		if (!!connection) {
			connection.send(msg);
		} else {
			logLine("Error finding connection: ", connectionId);
		}
	});

	// req -> progress -> multer
	req.pipe(bodyProgress);
	bodyProgress.headers = req.headers;

	/**
	 * Starts, when uploading progress is over.
	 */
	attachment(bodyProgress, res, err => {
		if (err) {
			res.status(500);
		}

		const fileId = uuidv1();

		const fileData = {
			fileId,
			comment: bodyProgress.body.comment || "",
			fileName: bodyProgress.file.filename,
		};

		updateStorage(taskQueue, fileData);

		/**
		 * Starts, when storage updating progress is over or failed.
		 */
		taskQueue
			.on("done", id => {
				if (id === fileId) {
					logLine("Client's file is uploaded and stored.");

					WsWatcher.closeConnection(connectionId);

					res.redirect(302, "/history");
				}
			})
			.on("error", id => {
				if (id === fileId) {
					logLine("Client's file saving error!");

					WsWatcher.closeConnection(connectionId);

					res.redirect(302, "/history");
				}
			});
	});
});

webserver.get("/", async (req, res) => {
	const storageJson = await fsp.readFile(
		path.join(__dirname, "public", "storage.json"),
		"utf8"
	);

	const { uploads } = JSON.parse(storageJson);

	if (uploads.length > 0) {
		res.redirect(302, "/history");
	} else {
		res.render("main");
	}
});

// With uploads history
webserver.get("/history", async (req, res) => {
	const storageJson = await fsp.readFile(
		path.join(__dirname, "public", "storage.json"),
		"utf8"
	);

	const { uploads } = JSON.parse(storageJson);

	res.render("main", { shouldShowHistory: true, uploads });
});

// Download of file initiated ftom the client
webserver.get("/download/:downloadId", async (req, res) => {
	const storageJson = await fsp.readFile(
		path.join(__dirname, "public", "storage.json"),
		"utf8"
	);

	const { uploads } = JSON.parse(storageJson);
	const { downloadId } = req.params;

	const fileName = uploads.find(upload => upload.fileId === downloadId)
		.fileName;

	logLine("Client is downloading: ", fileName);

	const file = path.resolve(__dirname, "uploads", fileName);

	if (!file) {
		res.status(500).send("Sorry, this file has dissapeared!");
	} else {
		res.setHeader("Content-Disposition", "attachment");
		res.download(file, fileName);
	}
});

// Wrong URLs' handler
webserver.get("*", (req, res) => {
	res.status(404).send("Sorry, such page doesn't exist!");
});

webserver.listen(port, () =>
	logLine(`File uploader listening on port ${port}!`)
);
