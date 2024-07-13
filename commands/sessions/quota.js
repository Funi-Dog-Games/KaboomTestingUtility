const { SlashCommandBuilder } = require('discord.js');
const quota = require("../../configuration/quota.json")
const db = require("../../modules/db.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('quota')
		.setDescription('Check your progress towards the quota'),
	async execute(interaction) {
		if(quota.requireQuota == false) return interaction.reply("There is no quota set!");
	},
};