const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('deny')
		.setDescription('Deny the current thread (reviewers only)'),
	async execute(interaction) {
		await db.client.connect()
		if(await db.collections.reviewers.findOne({ uid: interaction.user.id })){
            if(!interaction.channel.isThread()) return interaction.reply({ content: "This command can only be ran in threads!", ephemeral: true });
			const thread = await db.collections.threads.findOne({ tid: interaction.channel.id, active: false, reviewed: false })
			if(!thread) return interaction.reply({ content: "This is not a reviewable session!", ephemeral: true })
			if(thread.reviewing == false) return interaction.reply({ content: "You cannot manually review a session, you must run /review first!", ephemeral: true })

			interaction.channel.send("Looks like this session has been denied.")
			await db.collections.threads.updateOne({ tid: interaction.channel.id, active: false, reviewed: false }, {"$set": {
				active: false,
				reviewed: true,
				accepted: false,
				reviewing: false,
				time: (thread.endTime - thread.startTime) / 1000
			}})

			interaction.reply({ content: "Denied", ephemeral: true})
        } else {
			interaction.reply({ content: "You are not a reviewer", ephemeral: true })
		}
	},
};