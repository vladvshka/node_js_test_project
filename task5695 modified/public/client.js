import {
	KEEP_ALIVE,
	CONNECTION_ID,
	PROGRESS,
	CLIENT_TIMEOUT,
	CLOSE_CONNECTION_ID,
	uuidv4,
} from "../shared/index.js";

(async () => {
	// TODO: move id generation to server. Make another req after GET of the main page.
	const connectionId = uuidv4();
	let connection = null;

	const updateProgressBar = progress => {
		const myBar = document.getElementById("myBar");
		let width = Math.round(progress * 100);

		if (width <= 100) {
			myBar.style.width = width + "%";

			document.getElementById("barLabel").innerHTML = width + "%";
		}
	};

	const closeWsConnection = () => {
		const connectionMsg = JSON.stringify({
			[CLOSE_CONNECTION_ID]: connectionId,
		});

		console.log("Client closing connectionMsg: ", connectionMsg);
		connection.send(connectionMsg);
	};

	const establishWebSocketConnection = () => {
		const url = `ws://${window.location.hostname}:7181/`;
		/**
		 * Web socket protocol supports text and binary data.
		 * In terms of Javascript, text refers to as a string, while binary data is represented like ArrayBuffer.
		 */
		connection = new WebSocket(url);

		connection.onopen = () => {
			const connectionMsg = JSON.stringify({ [CONNECTION_ID]: connectionId });

			console.log("Client connectionMsg: ", connectionMsg);
			connection.send(connectionMsg);
		};

		connection.onmessage = msg => {
			console.log("клиентом получено сообщение от сервера: " + msg.data);
			const data = JSON.parse(msg.data);

			if (data[PROGRESS]) {
				const progress = data[PROGRESS];
				updateProgressBar(progress);
			}
		};

		connection.onerror = error => {
			console.log("WebSocket error:", error);
		};

		connection.onclose = event => {
			console.log(
				`соединение с сервером закрыто: ${event.code}, ${event.reason}`
			);
			connection = null;
			// clearInterval(keepAliveTimer);
		};

		// const keepAliveTimer = setInterval(() => {
		// 	connection.send(KEEP_ALIVE);
		// }, CLIENT_TIMEOUT);
	};

	const handleUpload = async e => {
		e.preventDefault();
		e.stopPropagation();

		const form = document.getElementById("form");

		const formData = new FormData(form);

		// File attachment and connectionId is a must!
		if (!connectionId || formData.get("attachment").size === 0) {
			return;
		}

		const url = encodeURI(`/upload/?CONNECTION_ID=${connectionId}`);

		const myProgress = document.getElementById("myProgress");
		myProgress.style.visibility = "visible";

		establishWebSocketConnection();

		try {
			const response = await fetch(url, {
				method: "POST",
				body: formData,
			});

			closeWsConnection();

			// Have to handle redirect manually, as default POST handler has been rewritten by handleUpload.
			window.location = response.url;
		} catch (error) {
			console.error("error", error);
		}
	};

	document.getElementById("form").addEventListener("submit", handleUpload);
})();
