const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const multer = require("multer");
const fetch = require("isomorphic-fetch");

const { getFullUrl, makeRequest, getOptions } = require("./utils");

const webServer = express();
const upload = multer();

const port = 7180;
// const hbs = exphbs.create();

// view engine setup
webServer.engine("handlebars", exphbs()); // регистрируем движок шаблонов handlebars в списке движков шаблонов express
webServer.set("view engine", "handlebars"); // устанавливаем, что будет использоваться именно движок шаблонов handlebars
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

webServer.get("/", (req, res) => res.render("main_page"));

webServer.post("/", upload.none(), async (req, res) => {
	console.log("body: ", req.body);
	// add shared validation on empty!

	const fullUrl = getFullUrl(req.body);
	const options = getOptions(req.body);

	const result = await makeRequest(fullUrl, options);

	res.status(200);
});

webServer.listen(port, () =>
	console.log(`Postman WS listening on port ${port}!`)
);
