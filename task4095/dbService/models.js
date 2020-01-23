import Sequelize from "sequelize";

export const RequestModel = {
	url: {
		type: Sequelize.JSON,
		allowNull: false,
	},
	options: {
		type: Sequelize.JSON,
		defaultValue: null,
	},
};
