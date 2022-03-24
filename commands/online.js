const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { guildID, channelID } = require('../config.json');
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('онлайн')
		.setDescription('Показывает онлайн Тесея.'),
	async execute(interaction) {

		const res = await fetch(`https://mcapi.us/server/query?ip=theseus.su`) // Fetches current server status via mcapi
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
				} else message.addField(`Текущий онлайн (0/${playersMax}):`, 'Ноль. Полотно пустует.');

				fs.readFile('persistent.json', 'utf-8', async (err, data) => {
					if (err)
						console.error(err);
					else {
						let persistent = JSON.parse(data);
						message.addField("Текущий рекорд онлайна: ", `${persistent.currentRecord.toString()} человек.`, true);

						if (players > persistent.currentRecord) { // Announce the new record
							let announcementChannel = interaction.client.guilds.cache.get(guildID)
								.channels.cache.get(channelID);

							let embedAnnouncement = new MessageEmbed()
								.setTitle("Theseus")
								.setColor("AQUA")
								.setThumbnail("https://theseus.su/logo.png")
								.addField("Достигнут новый рекорд онлайна!", `Предыдущий рекорд: ${persistent.currentRecord}\nНовый рекорд: ${players}`)
								.addField("Онлайн в момент рекорда:", `${playerList}`)
								.setTimestamp();

							if (persistent.recordMessage != 0)
								await announcementChannel.messages.delete(persistent.recordMessage)
								.catch(console.error);

							await announcementChannel.send({
									embeds: [embedAnnouncement]
								})
								.then(message => persistent.recordMessage = message.id);

							persistent.currentRecord = players;

							fs.writeFile('persistent.json', JSON.stringify(persistent), 'utf-8', (err) => {
								if (err)
									throw err;
							});
						}
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
					status: 'online'
				});

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
					}],
					status: 'dnd'
				});
			};
		};
	},
};