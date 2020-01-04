import { KEEP_ALIVE, CONNECTION_ID, PROGRESS } from "../shared/index.js";

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
	let connection = new WebSocket(url); // это сокет-соединение с сервером

	connection.onopen = event => {
		// connection.send("hello from client to server!"); // можно послать строку, Blob или ArrayBuffer
	};

	connection.onmessage = msg => {
		console.log("клиентом получено сообщение от сервера: " + msg.data);
		const data = JSON.parse(msg.data);

		if (data[CONNECTION_ID]) {
			connectionId = data[CONNECTION_ID];
			console.log(CONNECTION_ID, connectionId);
		} else if (data[PROGRESS]) {
			const progress = data[PROGRESS];
			console.log(PROGRESS, progress);
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

	// чтобы сервер знал, что этот клиент ещё жив, будем регулярно слать ему сообщение "я жив"
	const keepAliveTimer = setInterval(() => {
		connection.send(KEEP_ALIVE); // вот эту строчку бы зашарить с сервером!
	}, 20000); // и это число!

	const handleSubmit = async e => {
		e.preventDefault();
		e.stopPropagation();

		const form = document.getElementById("form");

		const formData = new FormData(form);
		const url = encodeURI(`/upload/?CONNECTION_ID=${connectionId}`);

		try {
			const response = await fetch(url, {
				method: "POST",
				body: formData,
			});

			// Have to handle redirect manually, as default POST handler has been rewritten by handleSubmit.
			window.location = response.url;
		} catch (error) {
			console.error("error", error);
		}
	};

	document.getElementById("form").addEventListener("submit", handleSubmit);
})();
