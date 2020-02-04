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

require("./server");
require("./router");
require("./utils/helpers");
require("./utils/networkHelpers");
require("./dbService/index");
require("./dbService/models");
