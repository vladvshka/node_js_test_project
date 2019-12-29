const express = require("express");
const path = require("path");
const multer = require("multer");
const fetch = require("isomorphic-fetch");
const pug = require("pug");

const { getFullUrl, makeRequest, getOptions } = require("./utils");

const webServer = express();
const upload = multer();

const port = 7180;

// view engine setup
webServer.set("view engine", "pug"); // устанавливаем, что будет использоваться именно движок шаблонов pug
webServer.set("views", path.join(__dirname, "views")); // задаём папку, в которой будут шаблоны

// middlewares
webServer.use(express.json());
webServer.use(express.urlencoded({ extended: false }));
webServer.use(express.static(path.join(__dirname, "public")));

webServer.use("*", (req, res, next) => {
	// add logging
	// add validation
	console.log("Request made on url: ", req.originalUrl);

	next();
});

// error handler
webServer.use((err, req, res, next) => {
	console.log("err", err);
	// render the error page
	res.sendStatus(err.status || 500);
});

webServer.get("/", (req, res) => res.render("main"));

webServer.post("/", upload.none(), async (req, res) => {
	console.log("body: ", req.body);
	// add shared validation on empty!

	const fullUrl = getFullUrl(req.body);
	const options = getOptions(req.body);

	// const result = await makeRequest(fullUrl, options);

	// console.log("result", result);

	res.render("main", { shouldShowResponse: true });

	// res.sendStatus(200);
});

webServer.listen(port, () => console.log(`Postman listening on port ${port}!`));
