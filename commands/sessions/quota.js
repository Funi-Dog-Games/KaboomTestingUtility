const { SlashCommandBuilder } = require('discord.js');
const quota = require("../../configuration/quota.json")
const db = require("../../modules/db.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('quota')
		.setDescription('Check your progress towards the quota'),
	async execute(interaction) {
		if(quota.requireQuota == false) return interaction.reply("There is no quota set!");
		const data = await db.collections.users.findOne({ uid: interaction.user.id })
		if(!data || !data.quota) return interaction.reply(`Time: 0:00\nQuota: ${quota.hours} hours\nMet: No`)

		const hours = Math.floor(data.quota / (60 * 60)).toString().padStart(2, '0')
		const minutes = Math.floor((data.quota / 60) % 60).toString().padStart(2, '0');
		const seconds = Math.floor(data.quota % 60).toString().padStart(2, '0');

		interaction.reply(`Time: ${hours}:${minutes}:${seconds}\nQuota: ${quota.hours} hours\nMet: ${Math.floor(data.quota / (60 * 60)) >= quota.hours ? "Yes" : "No"}`)
	},
};