const logLine = (...args) => {
	console.log(...args);
	console.log("========================");
};

const formHistoryList = history => {
	if (history && history.length) {
		return history.map(request => ({
			id: request.id,
			method: JSON.parse(request.options).method,
			url: JSON.parse(request.url),
		}));
	}
	return null;
};

export { logLine, formHistoryList };
