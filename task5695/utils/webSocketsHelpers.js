class WebSocketsWatcher {
	constructor() {
		this.clients = [];
		this.initWatcher();
	}

	initWatcher() {
		setInterval(() => {
			if (this.clients.length > 0) {
				const currentClients = this.clients;

				currentClients.forEach(client => {
					if (Date.now() - client.lastkeepalive > 50000) {
						client.connection.terminate(); // если клиент уже давно не отчитывался что жив - закрываем соединение
						client.connection = null;
					}
				});

				this.clients = currentClients.filter(client => client.connection);
			}
		}, 3000);
	}

	addClient(connection, connectionId) {
		const client = {
			connection,
			connectionId,
			lastkeepalive: Date.now(),
		};
		this.clients.push(client);
	}

	updateConnectionTime(connectionId) {
		this.clients.forEach(client => {
			if (client.connectionId === connectionId) {
				console.log("KEEP_ALIVE from client:", client.connectionId);
				client.lastkeepalive = Date.now();
			}
		});
	}

	getConnectionById(connectionId) {
		let result = null;

		this.clients.forEach(client => {
			console.log(client.connectionId);
			console.log("++++++++++++++++");
			console.log(connectionId);

			if (client.connectionId === connectionId) {
				client.lastkeepalive = Date.now();
				result = client.connection;
			}
		});

		return result;
	}
}

module.exports = {
	WebSocketsWatcher,
};
