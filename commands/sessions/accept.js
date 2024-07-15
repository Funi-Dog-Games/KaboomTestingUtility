const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('accept')
		.setDescription('Accept the current thread (reviewers only)')
		.addStringOption(o => 
			o.setName("minutes").setDescription("How many minutes to give").setRequired(false)
		),
	async execute(interaction) {
		await db.client.connect()
		if(await db.collections.reviewers.findOne({ uid: interaction.user.id })){
            if(!interaction.channel.isThread()) return interaction.reply("This command can only be ran in threads!");
			const thread = await db.collections.threads.findOne({ tid: interaction.channel.id, active: false, reviewed: false })
			if(!thread) return interaction.reply("This is not a reviewable session!")

			const minutes = interaction.options.getString("minutes") || (thread.endTime - thread.startTime) / 1000

			interaction.channel.send("Congrats! This session has been approved!")
			await db.collections.threads.updateOne({ tid: interaction.channel.id, active: false, reviewed: false }, {"$set": {
				uid: thread.uid,
				tid: thread.tid,
				active: false,
				reviewed: true,
				accepted: true,
				time: minutes
			}})

			const user = await db.collections.users.findOne({ uid: interaction.user.id })
			if(user){
				await db.collections.users.updateOne({ uid: interaction.user.id }, {"$set": {
					uid: interaction.user.id,
					quota: user.quota + minutes
				}})
			} else {
				await db.collections.users.insertOne({
					uid: interaction.user.id,
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