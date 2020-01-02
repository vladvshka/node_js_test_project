const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

const storagePath = path.join(__dirname, "../", "public", "storage.json");
const uploadsPath = path.join(__dirname, "../", "uploads");

/**
 * Technical script to clear storage.json
 */
fs.readFile(storagePath, (err, data) => {
	if (err) {
		console.log("Error reading storage", err);
	} else {
		const storage = JSON.parse(data);
		storage.uploades = [];

		fs.writeFile(storagePath, JSON.stringify(storage), err => {
			if (err) {
				console.log("Error writing storage", err);
				reject(err);
			} else {
				console.log("Storage has been cleared!");
			}
		});
	}
});

/**
 * Technical script to clear uploads folder
 */
fs.readdir(uploadsPath, async (err, files) => {
	if (err) console.log(err);
	for (const file of files) {
		if (file !== ".gitignore") {
			await fsp.unlink(path.join(uploadsPath, file), err => {
				if (err) console.log(err);
			});
		}
	}
});
