const path = require("path");
const fs = require("fs");

const storagePath = path.join(__dirname, "../", "public", "storage.json");

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
