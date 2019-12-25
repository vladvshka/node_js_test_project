const readline = require("readline");
const fsp = require("fs").promises;
const fs = require("fs");
// Node's native module. Provides compression functionality implemented using Gzip and Deflate/Inflate.
const zlib = require("zlib");
const path = require("path");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const logLine = (...strings) => {
	console.log("===================");
	console.log(...strings);
};

const gzipFile = pathToFile =>
	new Promise((resolve, reject) => {
		// All streams are instances of EventEmitter.
		const readable = fs.createReadStream(pathToFile);
		const writable = fs.createWriteStream(`${pathToFile}.gz`);
		const gzip = zlib.createGzip();

		logLine("Start gzipping ", pathToFile);

		readable
			.pipe(gzip)
			.on("error", err => {
				logLine("Error gzipping ", pathToFile);
				writable.end();
				return reject(err);
			})
			.pipe(writable)
			.on("error", err => {
				logLine("Error writing ", pathToFile);
				return reject(err);
			})
			.on("close", () => {
				logLine("Successfully gziped ", pathToFile);
				return resolve();
			});
	});

const getShouldGzipFile = async (pathToFile, fileStats) => {
	try {
		// check if gzipped version present.
		const gzStats = await fsp.stat(`${pathToFile}.gz`);

		logLine(`Gzipped version found: ${pathToFile}.gz`);

		// Obtain edit/create times.
		const fileLastModified = fileStats.mtime;
		const gzCreationTime = gzStats.ctime;

		// the later date is more.
		if (new Date(gzCreationTime) >= new Date(fileLastModified)) {
			logLine(`${pathToFile}.gz version is valid. Heading to the next file.`);
			return false;
		} else {
			logLine("Gzipped version is outdated");
			return true;
		}
	} catch (err) {
		return true;
	}
};

const processDirectory = async pathToDir => {
	// don't take into consideration gzipped files for processing.
	const isGzip = path.extname(pathToDir) === ".gz";

	if (isGzip) {
		return false;
	}

	try {
		const stats = await fsp.stat(pathToDir);

		if (stats.isFile()) {
			const shouldGzip = await getShouldGzipFile(pathToDir, stats);

			if (shouldGzip) {
				await gzipFile(pathToDir);
			}
		} else {
			const files = await fsp.readdir(pathToDir, "utf-8");

			logLine(`files found in ${pathToDir}: `, files);

			for (const fileName of files) {
				const innerFile = path.join(pathToDir, fileName);
				await processDirectory(innerFile);
			}
		}
	} catch (err) {
		logLine("Check the path, you've entered");
		rl.close();
	}
};

rl.question(
	"\nHello! It's AutoCompressor. Please, enter a path to some directory:",
	async answer => {
		if (!answer) {
			logLine("No file provided.");
			rl.close();
		} else {
			await processDirectory(answer);
			logLine("Done");

			rl.close();
			// D:\It-academy\Node 2019\Task_folder
		}
	}
);

// The 'SIGINT' event is emitted whenever the input stream receives a <ctrl>-C input.
rl.on("SIGINT", () => {
	rl.question("Are you sure you want to exit? ", answer => {
		if (answer.match(/^y(es)?$/i)) rl.close();
	});
});

rl.on("error", () => {
	logLine("Runtime error. Exiting...");
	process.exit(0);
});

rl.on("close", () => {
	logLine("Goodbye!");
	process.exit(0);
});
