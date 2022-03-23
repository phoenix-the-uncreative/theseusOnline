const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('онлайн')
		.setDescription('Показывает онлайн Тесея.'),
	async execute(interaction) {

        const res = await fetch(`https://eu.mc-api.net/v3/server/ping/theseus.su`);

        if (!res) {
            return false;
        } else {
            const body = await res.json()
            const status = (body.online ? "Online" : "Offline")
            let message = new MessageEmbed()
                .setTitle("Theseus")
                .setColor("RED")
                .setThumbnail("https://theseus.su/logo.png");

            if (status == "Online") {
                message.addField("Статус сервера", "Онлайн");
                message.setColor("GREEN");
                const players = body.players.online
                const playersMax = body.players.max

                let playerList = "";
                if (players > 0) {
                    let i = 1;
                    body.players.sample.forEach(item => { 
                        playerList = playerList + i + ". " + item.name + ",\n"; 
                        if (i == body.players.sample.length) playerList = playerList.slice(0, playerList.length - 2) + ".";
                        i++;
                 })
                message.addField(`Текущий онлайн (${players}/${playersMax}):`, `${playerList}`);
                } else message.addField(`Текущий онлайн (0/${playersMax}):`, 'Ноль. Силур пустует.');

                interaction.reply({ embeds: [message], ephemeral: true});

                interaction.client.user.setPresence({ 
					activities: [{ name: ("Тесей (" + players + "/" + playersMax + ")") }],
					status: 'online'
				});
            } else {
                message.addField("Статус сервера", "Оффлайн");
                interaction.reply({ embeds: [message], ephemeral: true });
                interaction.client.user.setPresence({ 
                    activities: [{ name: ("Тесей (оффлайн)"), type: "WATCHING" }],
                    status: 'dnd'
                });
            };
        };
        },
};