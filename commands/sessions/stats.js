const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('View your statistics'),
	async execute(interaction) {
        // This code is very poorly made, continue at your own risk
        await db.client.connect()
		var total_time = await db.collections.threads.find({ uid: interaction.user.id }).toArray()
        var approved_time = await db.collections.threads.find({ uid: interaction.user.id, accepted: true }).toArray()
        var denied_time = await db.collections.threads.find({ uid: interaction.user.id, accepted: false }).toArray()
        await db.client.close()

        if(total_time.length == 0) total_time = [{time: 0}]
        if(approved_time.length == 0) approved_time = [{time: 0}]
        if(denied_time.length == 0) denied_time = [{time: 0}]

        function sumTime(threads) {
            return threads.reduce((acc, thread) => acc + (thread.time || 0), 0);
        }  

        total_time = sumTime(total_time)
        approved_time = sumTime(approved_time)
        denied_time = sumTime(denied_time)

        const total_time_hours = Math.floor(total_time / (60 * 60)).toString().padStart(2, '0')
        const total_time_minutes = Math.floor((total_time / 60) % 60).toString().padStart(2, '0');
        const total_time_seconds = Math.floor(total_time % 60).toString().padStart(2, '0');

        const approved_time_hours = Math.floor(approved_time / (60 * 60)).toString().padStart(2, '0')
        const approved_time_minutes = Math.floor((approved_time / 60) % 60).toString().padStart(2, '0');
        const approved_time_seconds = Math.floor(approved_time % 60).toString().padStart(2, '0');

        const denied_time_hours = Math.floor(denied_time / (60 * 60)).toString().padStart(2, '0')
        const denied_time_minutes = Math.floor((denied_time / 60) % 60).toString().padStart(2, '0');
        const denied_time_seconds = Math.floor(denied_time % 60).toString().padStart(2, '0');

        interaction.reply(`
            Total Time: ${total_time_hours}:${total_time_minutes}:${total_time_seconds}\nApproved Time: ${approved_time_hours}:${approved_time_minutes}:${approved_time_seconds}\nDenied Time: ${denied_time_hours}:${denied_time_minutes}:${denied_time_seconds}
        `)
	},
};