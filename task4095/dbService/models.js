import Sequelize from "sequelize";

const RequestModel = {
	url: {
		type: Sequelize.JSON,
		allowNull: false,
	},
	options: {
		type: Sequelize.JSON,
		defaultValue: null,
	},
};

export { RequestModel };
