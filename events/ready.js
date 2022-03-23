const fetch = require('node-fetch');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in at ${(new Date).toTimeString()} with username ${client.user.tag}.`);
		
		let updateInterval = 60000;
		const updateStatus = async () => {
			const theseusData = await fetch(`https://eu.mc-api.net/v3/server/ping/theseus.su`);
			if (!theseusData) return
		
			const body = await theseusData.json();
			const status = (body.online ? "Online" : "Offline")
		
			if (status == "Online") {
				client.user.setPresence({ 
					activities: [{ name: ("Тесей (" + body.players.online + "/" + body.players.max + ")") }],
					status: 'online'
				});

				updateInterval = (body.players.online > 0 ? 60000 : 300000);
			} else client.user.setPresence({ 
				activities: [{ name: ("Тесей (оффлайн)"), type: "WATCHING" }],
				status: 'dnd'
			});
		};

		updateStatus();
		
		setInterval(() => updateStatus(), updateInterval)
	},
};