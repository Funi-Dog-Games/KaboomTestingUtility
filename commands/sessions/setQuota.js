const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setquota')
		.setDescription('Set the quota for a user')
        .addUserOption(o => 
            o.setName("user").setDescription("User to set the quota of").setRequired(true)
        )
        .addNumberOption(o =>
            o.setName("quota").setDescription("Quota to set").setRequired(true)
        ),
	async execute(interaction) {
        await db.client.connect()
		if(!await db.collections.reviewers.findOne({ uid: interaction.user.id })) return interaction.reply({ message: "You are not a reviewer", ephemeral: true })
        const user = interaction.options.getUser("user")
        const quota = interaction.options.getNumber("quota")
        const usr = await db.collections.users.findOne({ uid: user.id })
        if(usr){
            await db.collections.users.updateOne({ uid: user.id }, {"$set": { quota }})
        } else {
            await db.collections.users.insertOne({ uid: user.id, quota })
        }

        interaction.reply({ content: "Set the quota successfully", ephemeral: true })
	},
};