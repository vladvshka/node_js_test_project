import Sequelize from "sequelize";
import { RequestModel } from "./models";
import { logLine } from "../utils/helpers";

const sequelize = new Sequelize("postman", "root", "1234", {
	host: "localhost",
	dialect: "mysql",
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

const Requset = sequelize.define("request", RequestModel);

// { force: true }
sequelize.sync().then(() => {
	logLine("Database & tables created!");
});

export const dbService = {
	saveRequest: async (fullUrl, options) => {
		try {
			const newRequest = await Requset.create({
				url: JSON.stringify(fullUrl),
				options: JSON.stringify(options),
			});

			logLine(`newRequest added: ${JSON.stringify(newRequest)}`);

			return true;
		} catch (error) {
			logLine(`newRequest addition error: ${JSON.stringify(error)}`);

			return false;
		}
	},

	getAllRequests: async () => {
		try {
			const allRequests = await Requset.findAll();

			logLine("obtaining all records");

			return allRequests;
		} catch (error) {
			logLine(`obtaining all records error: ${JSON.stringify(error)}`);

			return null;
		}
	},

	getRequestById: async id => {
		try {
			const request = await Requset.findByPk(id);
			return request;
		} catch (error) {
			logLine(`obtaining all records error: ${JSON.stringify(error)}`);
			return null;
		}
	},
};
