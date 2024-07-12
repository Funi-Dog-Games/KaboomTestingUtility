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
                {$match: {active: false}},
                {$sample: {size: 1}}
            ]).toArray()
            await db.client.close()
            if(session.length == 0){ return interaction.reply("There are no sessions to review!") }
            interaction.reply(`Found a session! Your review will be on <#${session[0].tid}>`)
        } else {
            await db.client.close()
            return interaction.reply("Unauthorized")
        }
	},
};