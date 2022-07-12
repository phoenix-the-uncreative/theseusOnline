const fetch = require('node-fetch');
const record = require('../functions/record');
const { guildID, channelID, serverIP, serverPort } = require('../config.json');
const fs = require('fs');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Logged in at ${(new Date).toTimeString()} with username ${client.user.tag}.`);
		
		let updateInterval = 60000;
		const updateStatus = async () => {
			const theseusData = await fetch(`https://mcapi.us/server/query?ip=${serverIP}&port=${serverPort}`)
			if (!theseusData) return
		
			const body = await theseusData.json();
			const status = (body.online ? "Online" : "Offline")
		
			if (status == "Online") {
				client.user.setPresence({ activities: [{ name: ("Тесей (" + body.players.now + "/" + body.players.max + ")") }] });
				client.user.setStatus('online');

				fs.readFile('persistent.json', 'utf-8', async (err, data) => {
					if (err)
						console.error(err);
					else {
						let persistent = JSON.parse(data);
						let playerList = "";
						let i = 1;

						let sortedList = await body.players.list.sort((a, b) => a.localeCompare(b)); // Sorting the list alphabetically

						await sortedList.forEach(item => {
							playerList = playerList + i + ". " + item + ",\n";
							if (i == sortedList.length) playerList = playerList.slice(0, playerList.length - 2) + ".";
							i++;
						});

						if (body.players.now  > persistent.currentRecord) record.announce(body.players.now , playerList, client.guilds.cache.get(guildID).channels.cache.get(channelID));
					}
				});

				updateInterval = (body.players.now > 0 ? 60000 : 300000);
			} else { 
				client.user.setPresence({  activities: [{ name: ("Тесей (оффлайн)"), type: "WATCHING" }] });
				client.user.setStatus('dnd');
			}
		};

		updateStatus();
		
		setInterval(() => updateStatus(), updateInterval)
	},
};