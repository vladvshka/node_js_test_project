require("@babel/register")({
	ignore: [/(node_modules)/],
	presets: [
		[
			"@babel/preset-env",
			{
				targets: {
					node: "10.12", // код будет запускаться под Node.js версии 10 и позже
				},
			},
		],
	],
});

require("./index"); // этот require бабель перекрыл (благодаря @babel/register) и уже транспилирует код перед тем как Node.js его выполнит
require("./utils/webSocketsHelpers");
