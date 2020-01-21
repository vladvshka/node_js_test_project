const express = require("express");
const path = require("path");
const { logLine } = require("./utils/helpers");
const { router } = require("./router");

const webServer = express();
const port = 7180;

// view engine setup
webServer.set("view engine", "pug"); // устанавливаем, что будет использоваться именно движок шаблонов pug
webServer.set("views", path.join(__dirname, "views")); // задаём папку, в которой будут шаблоны

// middlewares
webServer.use(express.json());
webServer.use(express.urlencoded({ extended: false }));
webServer.use(express.static(path.join(__dirname, "public")));

webServer.use("*", (req, res, next) => {
	// add validation
	logLine("Request made on url: ", req.originalUrl);
	next();
});

// error handler
webServer.use((err, req, res, next) => {
	logLine("err", err);
	res.sendStatus(err.status || 500);
});

webServer.use("/", router);

webServer.listen(port, () => logLine(`Postman listening on port ${port}!`));
