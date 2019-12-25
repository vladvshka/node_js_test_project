const readline = require("readline");
const fs = require("fs");
const fsp = require("fs").promises;
// const path = require("path");
const zlib = require("zlib");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const gzip = zlib.createGzip();

const handleError = err => {
	console.log("err", err);
	return false;
};

const createGzip = pathToFile => {
	const inp = fs.createReadStream(pathToFile);
	const out = fs.createWriteStream(`${pathToFile}.gz`);

	console.log("Start gzipping: ", pathToFile);

	inp
		.pipe(gzip)
		.on("error", err => {
			return handleError(err);
		})
		.pipe(out)
		.on("error", err => {
			return handleError(err);
		})
		.on("end", () => {
			console.log("Gziped ", pathToFile);
		});
};

const handleGzip = async (pathToFile, fileStats) => {
	try {
		const gzStats = await fsp.stat(`${pathToFile}.gz`);

		console.log("existas");

		const fileLastModified = fileStats.mtime;
		const gzCreated = gzStats.ctime;

		// later date is more.
		if (new Date(gzCreated) >= new Date(fileLastModified)) {
			return true;
		}

		createGzip(pathToFile);
		console.log("After gzip");
	} catch (error) {
		createGzip(pathToFile);
		console.log("After gzip");
	}
};

const processCompression = async pathToDir => {
	const isGzip = pathToDir.endsWith(".gz");

	if (isGzip) {
		return false;
	}

	try {
		const stats = await fsp.stat(pathToDir);

		if (stats.isFile()) {
			console.log("file: " + pathToDir);

			await handleGzip(pathToDir, stats);
		} else {
			const files = await fsp.readdir(pathToDir);

			console.log(`files in ${pathToDir}: `, files);

			for (const file of files) {
				await processCompression(`${pathToDir}/${file}`);
			}
		}
	} catch (error) {
		console.log(error);

		rl.close();
	}
};

rl.question(
	"Hello! It's AutoCompressor. Please, enter a path to some directory:\n",
	async answer => {
		if (!answer) {
			rl.close();
		} else {
			await processCompression(answer);
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
	console.log("Goodbye!");
	process.exit(0);
});

rl.on("close", () => {
	console.log("Goodbye!");
	process.exit(0);
});
