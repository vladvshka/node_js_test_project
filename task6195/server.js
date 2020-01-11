const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");

const { router } = require("./utils/router");
const { logLine } = require("./utils/helpers");

const webserver = express();
const port = 7180;

webserver.use(favicon(path.join(__dirname, "static", "favicon.ico")));
webserver.use("/explorer", express.static(path.join(__dirname, "static")));

webserver.set("view engine", "pug"); // устанавливаем, что будет использоваться именно движок шаблонов pug
webserver.set("views", path.join(__dirname, "views")); // задаём папку, в которой будут шаблоны

webserver.use("/explorer", router);
webserver.get("/", (req, res) => {
	res.redirect(302, "/explorer");
});

webserver.listen(port, () =>
	logLine(`SQL explorer listening on port ${port}!`)
);
