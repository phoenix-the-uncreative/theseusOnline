const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
    announce : function async (players, playerList, announcementChannel) {
        fs.readFile('persistent.json', 'utf-8', async (err, data) => {
                if (err)
                    console.error(err);
                else {
                    let persistent = JSON.parse(data); 
                    if (players > persistent.currentRecord) { 

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
                }
            });
    }
};