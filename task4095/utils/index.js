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

	console.log(`${name}Object`, keyValueObject);

	return keyValueObject;
};

const isJsonValid = structure => {
	if (typeof structure !== "string") {
		return false;
	}
	try {
		JSON.parse(structure);

		return true;
	} catch (error) {
		return false;
	}
};

const getFullUrl = body => {
	const paramsObject = getKeyValueObject(body, "param");
	const searchParams = new URLSearchParams(paramsObject);
	console.log("searchParams", searchParams);

	const url = new URL(body.url);
	console.log("url", url);

	url.search = searchParams;

	console.log("url new", url);

	return url;
};

const makeRequest = async (fullUrl, options) => {
	try {
		const proxy_response = await fetch(fullUrl.href, options);

		if (proxy_response.ok) {
			const responseText = await proxy_response.text();

			if (isJsonValid(responseText)) {
				const data = JSON.parse(responseText);

				return data;
			}

			return responseText;
		}
	} catch (error) {
		console.error("error", error);
		return null;
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

	console.log("options", options);

	return options;
};

module.exports = {
	getFullUrl,
	makeRequest,
	getOptions,
};
