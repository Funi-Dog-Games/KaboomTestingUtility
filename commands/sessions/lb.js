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
            },
            accepted: true
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

        var users = [];

        data.forEach((entry) => {
            let user = users.find(user => user.uid === entry.uid);
            
            if (user) {
                user.time += entry.time;
            } else {
                users.push({
                    uid: entry.uid,
                    time: entry.time
                });
            }
        });

        users.sort(function(a, b){return b.time - a.time})

        const dPromise = users.map(async (item, index) => {
            const hours = Math.floor(item.time / (60 * 60)).toString().padStart(2, '0')
            const minutes = Math.floor((item.time / 60) % 60).toString().padStart(2, '0');
            const seconds = Math.floor(item.time % 60).toString().padStart(2, '0');

            try {
                const user = await interaction.client.users.cache.find(id => id.id === item.uid)
                return `#${index + 1} - <@${user.id}>: \`${hours}:${minutes}:${seconds}\``
            } catch {
                return `#${index + 1} - <@${item.uid}>: \`${hours}:${minutes}:${seconds}\``
            }
        })

        const description = (await Promise.all(dPromise)).join("\n")
        embed.setDescription(description)

        interaction.reply({ content: "Here is the top 10 leaderboard", embeds: [embed] })
	},
};