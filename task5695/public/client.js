import { KEEP_ALIVE } from "../shared/index.js";

(async () => {
	let CONNECTION_ID = null;

	const url = "ws://localhost:7181/";
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

		if (data.CONNECTION_ID) {
			CONNECTION_ID = data.CONNECTION_ID;
			console.log("CONNECTION_ID", CONNECTION_ID);
		} else if (data.PROGRESS) {
			PROGRESS = data.PROGRESS;
			console.log("PROGRESS", PROGRESS);
		}
	};

	connection.onerror = error => {
		console.log("WebSocket error:", error);
	};

	connection.onclose = () => {
		console.log("соединение с сервером закрыто");
		connection = null;
		clearInterval(keepAliveTimer);
	};

	// чтобы сервер знал, что этот клиент ещё жив, будем регулярно слать ему сообщение "я жив"
	const keepAliveTimer = setInterval(() => {
		connection.send(KEEP_ALIVE); // вот эту строчку бы зашарить с сервером!
	}, 5000); // и это число!

	const handleSubmit = async e => {
		e.preventDefault();
		e.stopPropagation();

		const form = document.getElementById("form");

		const formData = new FormData(form);
		const url = encodeURI(`/upload/?CONNECTION_ID=${CONNECTION_ID}`);

		try {
			await fetch(url, {
				method: "POST",
				body: formData,
			});
		} catch (error) {
			console.error("error", error);
		}
	};

	document.getElementById("form").addEventListener("submit", handleSubmit);
})();
