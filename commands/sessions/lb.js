const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require("../../modules/db.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('lb')
		.setDescription('View the time leaderboard'),
	async execute(interaction) {
        await db.client.connect()
		var data = await db.collections.threads.find({
            time: {
                $exists: 1
            }
        }, {
            uid: 1, time: 1
        }).sort({
            time: 1
        }).toArray()

        data = data.slice(1, 10)
        await db.client.close()

        if(!data) return interaction.reply("No approved sessions found!")

        const embed = new EmbedBuilder()
        .setTitle("Top 10 Times")
        .setColor("Random")

        const dPromise = data.map(async (item, index) => {
            const minutes = Math.floor(item.time / 60).toString().padStart(2, '0');
            const seconds = Math.floor(item.time % 60).toString().padStart(2, '0');
            try {
                const user = await interaction.client.users.cache.find(id => id.id === item.uid)
                return `#${index + 1} - <@${user.id}>: \`${minutes}:${seconds}\``
            } catch {
                return `#${index + 1} - *unknown user*: \`${minutes}:${seconds}\``
            }
        })

        const description = (await Promise.all(dPromise)).join("\n")
        embed.setDescription(description)

        interaction.reply({ content: "Here is the top 10 leaderboard", embeds: [embed] })
	},
};