// const storageObject = require("../public/storage.json");
const EventEmitter = require("events");
const path = require("path");
const fs = require("fs");

const storageName = "storage.json";

class TaskQueue extends EventEmitter {
	constructor() {
		super();
		this.queue = [];
		this.isTaskRunning = false;
	}

	addTask(task) {
		this.queue.push(task);
		this.runNextTask();
	}

	runNextTask() {
		if (!this.isTaskRunning) {
			if (this.queue.length > 0) {
				const firstTask = this.queue.shift();
				const taskPromise = firstTask();
				this.isTaskRunning = true;

				taskPromise
					.then(() => {
						console.log("Task succeed");
						this.taskRunning = false;
						this.runNextTask();
					})
					.catch(err => {
						console.log("Task execution error", err);
						this.emit("error", err);
					});
			} else {
				this.emit("done");
			}
		} else {
			this.emit("done");
		}
	}
}

/**
 * Storage is a single-for-all-users JSON file. That means:
 * 1) We should update it asynchronously, as it's not a util
 * 2) The file is accessed by many users so it's update must be managed in precedence of incoming requests one-by-one
 * 3) As it's JSON, it can't be appended
 */
const updateStorage = (taskQueue, newFileData) => {
	const task = () =>
		new Promise((resolve, reject) => {
			const storagePath = path.join(__dirname, "../", "public", storageName);

			fs.readFile(storagePath, (err, data) => {
				if (err) {
					console.log("Error reading storage", err);
					reject(err);
				}

				const storage = JSON.parse(data);
				storage.uploades.push(newFileData);

				fs.writeFile(storagePath, JSON.stringify(storage), err => {
					if (err) {
						console.log("Error writing storage", err);
						reject(err);
					}

					console.log("Storage has been updated!");
					resolve();
				});
			});
		});

	taskQueue.addTask(task);
};

module.exports = {
	TaskQueue,
	updateStorage,
};
