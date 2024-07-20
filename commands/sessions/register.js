const { SlashCommandBuilder } = require('discord.js');
const db = require("../../modules/db.js")
const noblox = require("noblox.js");
module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Connect a roblox user to a discord user')
        .addUserOption(o => 
            o.setName("user").setDescription("User to bridge").setRequired(true)
        )
        .addStringOption(o => 
            o.setName("username").setDescription("Roblox username of the user")
        ),
	async execute(interaction) {
		const user = interaction.options.getUser("user")
        const username = interaction.options.getString("username")

        const robloxID = await noblox.getIdFromUsername(user)
        if(!robloxID) return interaction.reply({ content: "Invalid user", ephemeral: true })

        await db.client.connect()
        const usr = await db.collections.users.findOne({ uid: user.id })
        if(usr){
            await db.collections.users.updateOne({ uid: user.id }, {"$set": {
                ruid: robloxID
            }})
        } else {
            await db.collections.users.insertOne({
                uid: interaction.user.id,
                quota: 0,
                ruid: robloxID
            })
        }
        await db.client.close()
        interaction.reply({ content: `The user has been bound to user id ${robloxID}`, ephemeral: true })
	},
};