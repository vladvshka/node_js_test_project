import fetch from "isomorphic-fetch";
import { logLine } from "./helpers";
import assert from "assert";

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

	// logLine(`${name}Object`, keyValueObject);

	return keyValueObject;
};

const getFullUrl = body => {
	const paramsObject = getKeyValueObject(body, "param");
	const searchParams = new URLSearchParams(paramsObject);
	const url = new URL(body.url);

	url.search = searchParams;

	return url;
};

const makeRequest = async (fullUrl, options) => {
	try {
		const proxy_response = await fetch(fullUrl.href, options);
		const responseText = await proxy_response.text();

		return {
			data: responseText,
			status: proxy_response.status,
			statusText: proxy_response.statusText,
			headers: JSON.stringify(proxy_response.headers._headers, null, 3),
			contentType: proxy_response.headers._headers["content-type"],
		};
	} catch (error) {
		console.error("error", error);
		throw new Error(error);
	}
};

// Options according to Fetch API.
const getOptions = reqBody => {
	const { method, body } = reqBody;
	const options = { method };
	const headers = getKeyValueObject(reqBody, "header");

	if (Object.entries(headers).length !== 0) {
		options.headers = headers;
	}

	if (method !== "GET") {
		options.body = body;
	}

	return options;
};

const validateFormData = reqBody => {
	const { method, body, url } = reqBody;
	const reg = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

	assert.doesNotThrow(() => {
		const urlMatches = url.match(reg);
		if (!urlMatches) {
			throw new Error("Incorrect URL address!");
		}
		if (!["POST", "GET"].includes(method)) {
			throw new Error("Not supported HTTP method!");
		}
		if (method === "POST" && !body) {
			throw new Error("POST without sending body is not valid!");
		}
	});
};

export { getFullUrl, makeRequest, getOptions, validateFormData };
