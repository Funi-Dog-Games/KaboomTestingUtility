const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('accept')
		.setDescription('Accept the current thread (reviewers only)')
		.addIntegerOption(o => 
			o.setName("minutes").setDescription("How many minutes to give").setRequired(false)
		),
	async execute(interaction) {
		await db.client.connect()
		if(await db.collections.reviewers.findOne({ uid: interaction.user.id })){
            if(!interaction.channel.isThread()) return interaction.reply({ content: "This command can only be ran in threads!", ephemeral: true });
			const thread = await db.collections.threads.findOne({ tid: interaction.channel.id, active: false, reviewed: false })
			if(!thread) return interaction.reply({ content: "This is not a reviewable session!", ephemeral: true })
			if(thread.reviewing != true) return interaction.reply({ content: "You cannot manually review a session, you must run /review first!", ephemeral: true })

			const minutes = (await interaction.options.getInteger("minutes") || ((thread.endTime - thread.startTime) / 1000) / 60) * 60

			interaction.channel.send(`Congrats! This session has been approved!${minutes != (thread.endTime - thread.startTime) / 1000 ? ` However, you received ${minutes / 60} minutes.` : ""}`)
			await db.collections.threads.updateOne({ tid: interaction.channel.id, active: false, reviewed: false }, {"$set": {
				active: false,
				reviewed: true,
				accepted: true,
				reviewing: false,
				time: minutes
			}})

			const user = await db.collections.users.findOne({ uid: thread.uid })
			if(user){
				await db.collections.users.updateOne({ uid: thread.uid }, {"$set": {
					quota: user.quota + minutes
				}})
			} else {
				await db.collections.users.insertOne({
					uid: thread.uid,
					quota: minutes
				})
			}

			interaction.reply({content: "Accepted", ephemeral: true})
        } else {
			interaction.reply({ content: "You are not a reviewer", ephemeral: true })
		}

		await db.client.close()
	},
};