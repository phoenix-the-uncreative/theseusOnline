const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { guildID, channelID, serverIP, serverPort } = require('../config.json');
const record = require('../functions/record.js')
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('онлайн')
		.setDescription('Показывает онлайн Тесея.'),
	async execute(interaction) {

		const res = await fetch(`https://mcapi.us/server/query?ip=${serverIP}&port=${serverPort}`) // Fetches current server status via mcapi
			.catch(err => {
				console.log("Failed to retrieve API response.");
				console.error(err);
				return;
			});

		if (!res) {
			return false;
		} else {
			const body = await res.json()
			const status = (body.online ? "Online" : "Offline")
			let message = new MessageEmbed()
				.setTitle("Theseus")
				.setColor("RED")
				.setThumbnail("https://theseus.su/logo.png")
				.setFooter(`Имейте в виду, что данные взяты с помощью стороннего API и могут быть устаревшими на несколько минут.`);;

			if (status == "Online") {
				message.addField("Статус сервера", "Онлайн");
				message.setColor("GREEN");
				const players = body.players.now
				const playersMax = body.players.max

				let sortedList = body.players.list.sort((a, b) => a.localeCompare(b)); // Sorting the list alphabetically

				let playerList = "";
				if (players > 0) { // Formatting the playerlist
					let i = 1;
					sortedList.forEach(item => {
						playerList = playerList + i + ". " + item + ",\n";
						if (i == sortedList.length) playerList = playerList.slice(0, playerList.length - 2) + ".";
						i++;
					})
					message.addField(`Текущий онлайн (${players}/${playersMax}):`, `${playerList}`);
				} else message.addField(`Текущий онлайн (0/${playersMax}):`, 'Ноль. Силур пустует.');

				fs.readFile('persistent.json', 'utf-8', async (err, data) => {
					if (err)
						console.error(err);
					else {
						let persistent = JSON.parse(data);
						message.addField("Текущий рекорд онлайна: ", `${persistent.currentRecord.toString()} человек.`, true);

						if (players > persistent.currentRecord) record.announce(players, playerList, interaction.client.guilds.cache.get(guildID).channels.cache.get(channelID));

						await interaction.reply({
							embeds: [message],
							ephemeral: true
						})
						.catch(console.error); // Ephemeral reply to the interaction with the formatted message after everything's complete
					}
				});

				interaction.client.user.setPresence({ // Update the presence
					activities: [{
						name: ("Тесей (" + players + "/" + playersMax + ")")
					}],
				});
				interaction.client.user.setStatus('online');

			} else {
				message.addField("Статус сервера", "Оффлайн");
				interaction.reply({
					embeds: [message],
					ephemeral: true
				});
				interaction.client.user.setPresence({
					activities: [{
						name: ("Тесей (оффлайн)"),
						type: "WATCHING"
					}]
				});
				interaction.client.user.setStatus('dnd');
			};
		};
	},
};