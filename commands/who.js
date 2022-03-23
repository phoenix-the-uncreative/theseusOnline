const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('кто')
		.setDescription('Тестовая команда. Выводит аптайм бота.'),
	async execute(interaction) {
		let uptime = interaction.client.uptime;
		await interaction.reply({ content: `
		Бот ir1s создан phoenix#8326, сугубо ради прикола. Имя совершенно ни к чему не отсылает.
		Аптайм: ${Math.floor(uptime / 3.6e+6)} часов, ${Math.floor(uptime / 60000)} минут и ${Math.floor(uptime / 1000)} секунд.
		`, ephemeral: true });
	},
};