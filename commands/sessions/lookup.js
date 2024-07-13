const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lookup')
		.setDescription('Check time for a user')
        .addUserOption(user => 
            user
                .setName("user")
                .setDescription("The user to search")
                .setRequired(true)
        ),
	async execute(interaction) {
		const user = interaction.options.getUser("user")
        await db.client.connect()
        var data = await db.collections.threads.find({
            uid: user.id,
            time: {
                $exists: 1
            }
        }, {
            time: 1
        }).toArray()

        if(!data) return interaction.reply("User does not have any approved sessions")

        var s = 0

        data.forEach((entry) => {
            if(entry.time){
                s = s + entry.time
            }
        })

        const hours = Math.floor(s / (60 * 60)).toString().padStart(2, '0')
		const minutes = Math.floor((s / 60) % 60).toString().padStart(2, '0');
		const seconds = Math.floor(s % 60).toString().padStart(2, '0');
        interaction.reply(`They have ${hours}:${minutes}:${seconds}!`)
	},
};