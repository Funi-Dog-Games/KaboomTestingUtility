const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Get your time registered in the database'),
	async execute(interaction) {
        await db.client.connect()
		const data = await db.collections.threads.find({ uid: interaction.user.id, active: false, reviewed: true, time: {$exists: 1} }).toArray()
        if(data.length === 0) return interaction.reply({content: "No approved sessions, found nothing to display!", ephemeral: true});
        await db.client.close()
        var s = 0

        data.forEach((entry) => {
            if(entry.time){
                s = s + entry.time
            }
        })

        const hours = Math.floor(s / (60 * 60)).toString().padStart(2, '0')
		const minutes = Math.floor((s / 60) % 60).toString().padStart(2, '0');
		const seconds = Math.floor(s % 60).toString().padStart(2, '0');
        interaction.reply(`You have ${hours}:${minutes}:${seconds}!`)
	},
};