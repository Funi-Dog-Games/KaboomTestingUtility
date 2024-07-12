const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('accept')
		.setDescription('Accept the current thread (reviewers only)'),
	async execute(interaction) {
		await db.client.connect()
		if(await db.collections.reviewers.findOne({ uid: interaction.user.id })){
            if(!interaction.channel.isThread()) return interaction.reply("This command can only be ran in threads!");
			const thread = await db.collections.threads.findOne({ tid: interaction.channel.id, active: false, reviewed: false })
			if(!thread) return interaction.reply("This is not a reviewable session!")

			interaction.channel.send("Congrats! This session has been approved!")
			db.collections.threads.updateOne({ tid: interaction.channel.id, active: false, reviewed: false }, {"$set": {
				uid: thread.uid,
				tid: thread.tid,
				active: false,
				reviewed: true,
				accepted: true,
				time: (thread.endTime - thread.startTime) / 1000
			}})
        }
	},
};