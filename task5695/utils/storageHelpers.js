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
		console.log("this.isTaskRunning", this.isTaskRunning);
		if (!this.isTaskRunning) {
			console.log("this.queue", this.queue);
			if (this.queue.length > 0) {
				const firstTask = this.queue.shift();
				const taskPromise = firstTask();
				this.isTaskRunning = true;

				return taskPromise
					.then(id => {
						console.log("Task succeed");
						this.isTaskRunning = false;
						this.emit("done", id);
						this.runNextTask();
					})
					.catch(err => {
						console.log("Task error: ", err);
						this.isTaskRunning = false;
						this.emit("error", id);
						this.runNextTask();
					});
			}
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
	console.log("in updateStorage");

	const task = () =>
		new Promise((resolve, reject) => {
			const storagePath = path.join(__dirname, "../", "public", storageName);

			fs.readFile(storagePath, (err, data) => {
				if (err) {
					console.log("Error reading storage", err);
					reject(err);
				}

				const storage = JSON.parse(data);
				console.log("storage", storage);
				storage.uploades.push(newFileData);

				fs.writeFile(storagePath, JSON.stringify(storage), err => {
					if (err) {
						console.log("Error writing storage", err);
						reject(err);
					}

					console.log("Storage has been updated!");
					resolve(newFileData.fileId);
				});
			});
		});

	console.log("task: ", task);

	taskQueue.addTask(task);
};

module.exports = {
	TaskQueue,
	updateStorage,
};
