const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('review')
		.setDescription('Review a random session'),
	async execute(interaction) {
        await db.client.connect()
		if(await db.collections.reviewers.findOne({ uid: interaction.user.id })){
            const session = await db.collections.threads.aggregate([
                {$match: {active: false, reviewed: false, reviewing: false}},
                {$sample: {size: 1}}
            ]).toArray()
            await db.client.close()
            if(session.length == 0) return interaction.reply("There are no sessions to review!")
            
            const channel = await interaction.client.channels.cache.get(session[0].channel)
            if(!channel){
                await db.client.connect()
                await db.collections.threads.deleteOne({ uid: session[0].uid, tid: session[0].tid })
                await db.client.close()
                return interaction.reply({ content: "Could not start a review since the channel the thread was made on does not exist, removing.", ephemeral: true })
            }
             
            const thread = channel.threads.cache.find(id => id.id == session[0].tid)
            
            if(!thread){
                await db.client.connect()
                await db.collections.threads.deleteOne({ uid: session[0].uid, tid: session[0].tid })
                await db.client.close()
                return interaction.reply({ content: "Could not start a review since the thread has been deleted or archived, removing.", ephemeral: true })
            }

            await db.client.connect()
            await db.collections.threads.updateOne({ tid: session.tid }, {"$set": {
                reviewing: true
            }})
            await db.client.close()
            
            interaction.reply({ content: `Found a session! Your review will be on <#${session[0].tid}>`, ephemeral: true })
            thread.send(`Review time for <@${session[0].uid}>! Today, <@${interaction.user.id}> will be your reviewer!`)
        } else {
            await db.client.close()
            interaction.reply({ content: "You are not a reviewer", ephemeral: true })
        }
	},
};