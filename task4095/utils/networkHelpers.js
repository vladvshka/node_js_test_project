const fetch = require("isomorphic-fetch");
const { logLine } = require("./helpers");

const getKeyValueObject = (body, name) => {
	const keyValueObject = Object.keys(body).reduce((accum, item) => {
		if (item.startsWith(`${name}Key`)) {
			try {
				const itemNumber = Number(item.slice(-1));
				const itemValue = body[`${name}Value${itemNumber}`];

				if (itemValue) {
					return {
						...accum,
						[body[item]]: itemValue,
					};
				}

				return accum;
			} catch (error) {
				return accum;
			}
		}
		return accum;
	}, {});

	logLine(`${name}Object`, keyValueObject);

	return keyValueObject;
};

const getFullUrl = body => {
	const paramsObject = getKeyValueObject(body, "param");
	const searchParams = new URLSearchParams(paramsObject);
	logLine("searchParams", searchParams);

	const url = new URL(body.url);
	logLine("url", url);

	url.search = searchParams;

	logLine("url new", url);

	return url;
};

const makeRequest = async (fullUrl, options) => {
	try {
		const proxy_response = await fetch(fullUrl.href, options);

		if (proxy_response.ok) {
			const responseText = await proxy_response.text();
			data = responseText;

			return {
				data,
				status: proxy_response.status,
				statusText: proxy_response.statusText,
				headers: JSON.stringify(proxy_response.headers._headers, null, 3),
				contentType: proxy_response.headers._headers["content-type"],
			};
		}
	} catch (error) {
		console.error("error", error);
		throw new Error(error);
	}
};

// Options according to Fetch API.
const getOptions = reqBody => {
	const { method, body } = reqBody;
	const headers = getKeyValueObject(reqBody, "header");

	const options = { method };

	if (Object.entries(headers).length !== 0) {
		options.headers = headers;
	}

	if (method !== "GET") {
		options.body = body;
	}

	logLine("options", options);

	return options;
};

module.exports = {
	getFullUrl,
	makeRequest,
	getOptions,
};
