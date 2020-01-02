const express = require("express");
const progress = require("progress-stream");
const path = require("path");
const multer = require("multer"); // для обработки тел запроса в формате multipart/form-data
const { TaskQueue, updateStorage } = require("./utils");

const webserver = express();
const port = 7180;

// define cutom multer storage to keep file extension.
const multerStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, "uploads"));
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

// миддлварь для работы с multipart/form-data; если потребуется сохранение загруженных файлов - то в папку uploads.
const upload = multer({ storage: multerStorage });

// fieldname === attachment, it must be the name of input type="file"
const attachment = upload.single("attachment");

let taskQueue = new TaskQueue();

webserver.use(express.urlencoded({ extended: true }));
webserver.use(express.static(path.join(__dirname, "public")));

// checkStorageConsistency();

// Use progress->multer bundle to handle uploads.
webserver.post("/upload", (req, res) => {
	const bodyProgress = progress();
	const fileLength = +req.headers["content-length"]; // берём длину всего тела запроса

	// req -> progress -> multer
	req.pipe(bodyProgress);
	bodyProgress.headers = req.headers;

	bodyProgress.on("progress", info => {
		console.log("loaded " + info.transferred + " bytes of " + fileLength);
		console.log("========================");
	});

	attachment(bodyProgress, res, err => {
		if (err) {
			res.status(500);
		}

		console.log("body", bodyProgress.body);
		// file contains single "attachment"
		console.log("file", bodyProgress.file);

		const fileData = {
			comment: bodyProgress.body.comment,
			fileName: bodyProgress.file.filename,
		};

		updateStorage(taskQueue, fileData);

		taskQueue
			.on("done", () => {
				console.log("taskQueue done");
				res.redirect("/");
			})
			.on("error", err => {
				console.log("error", err);
				res.redirect("/");
			});
	});
});

webserver.listen(port, () =>
	console.log(`File uploader listening on port ${port}!`)
);
