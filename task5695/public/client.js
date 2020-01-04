import {
	KEEP_ALIVE,
	CONNECTION_ID,
	PROGRESS,
	CLIENT_TIMEOUT,
} from "../shared/index.js";

(async () => {
	const updateProgressBar = progress => {
		const myBar = document.getElementById("myBar");
		let width = Math.round(progress * 100);

		if (width <= 100) {
			myBar.style.width = width + "%";

			document.getElementById("barLabel").innerHTML = width + "%";
		}
	};

	let connectionId = null;

	const url = `ws://${window.location.hostname}:7181/`;
	/**
	 * Web socket protocol supports text and binary data.
	 * In terms of Javascript, text refers to as a string, while binary data is represented like ArrayBuffer.
	 */
	let connection = new WebSocket(url);

	connection.onmessage = msg => {
		console.log("клиентом получено сообщение от сервера: " + msg.data);
		const data = JSON.parse(msg.data);

		if (data[CONNECTION_ID]) {
			// connectionId is needed to identify client's requests on server.
			connectionId = data[CONNECTION_ID];
		} else if (data[PROGRESS]) {
			const progress = data[PROGRESS];
			updateProgressBar(progress);
		}
	};

	connection.onerror = error => {
		console.log("WebSocket error:", error);
	};

	connection.onclose = event => {
		console.log("соединение с сервером закрыто: ", event.code);
		connection = null;
		clearInterval(keepAliveTimer);
	};

	const keepAliveTimer = setInterval(() => {
		connection.send(KEEP_ALIVE);
	}, CLIENT_TIMEOUT);

	const handleUpload = async e => {
		e.preventDefault();
		e.stopPropagation();

		const form = document.getElementById("form");

		const formData = new FormData(form);

		// File attachment is a must!
		if (formData.get("attachment").size === 0) {
			return;
		}

		const url = encodeURI(`/upload/?CONNECTION_ID=${connectionId}`);

		try {
			const myProgress = document.getElementById("myProgress");
			myProgress.style.visibility = "visible";

			const response = await fetch(url, {
				method: "POST",
				body: formData,
			});

			// Have to handle redirect manually, as default POST handler has been rewritten by handleUpload.
			window.location = response.url;
		} catch (error) {
			console.error("error", error);
		}
	};

	document.getElementById("form").addEventListener("submit", handleUpload);
})();
