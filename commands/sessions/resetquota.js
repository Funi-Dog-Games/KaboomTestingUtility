const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require("../../modules/db.js")
const quota = require("../../configuration/quota.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resetquota')
		.setDescription('Reset everyone\'s quota and display those who did and did not pass'),
	async execute(interaction) {
		await db.client.connect()
        if(!await db.collections.reviewers.findOne({ uid: interaction.user.id })) return interaction.reply({ message: "You are not a reviewer", ephemeral: true })
        const data = await db.collections.users.find({ quota: { $exists: 1 } }).toArray()
        await db.client.close()

        if(quota.requireQuota == false) return interaction.reply({ content: "Quota is disabled.", ephemeral: true })
            if(data.length == 0) return interaction.reply({ content: "No users", ephemeral: true });

        const embed = new EmbedBuilder()
        .setTitle("Quota")

        data.sort(function(a,b) {return b.quota-a.quota})

        const dPromise = data.map(async (item) => {
            const hours = Math.floor(item.quota / (60 * 60)).toString().padStart(2, '0')
            const minutes = Math.floor((item.quota / 60) % 60).toString().padStart(2, '0');
            const seconds = Math.floor(item.quota % 60).toString().padStart(2, '0');

            try {
                const user = await interaction.client.users.cache.find(id => id.id === item.uid)
                return `${Math.floor(item.quota / (60 * 60)) >= quota.hours ? "✅" : "❌"} | <@${user.id}>: \`${hours}:${minutes}:${seconds}\``
            } catch {
                return `${Math.floor(item.quota / (60 * 60)) >= quota.hours ? "✅" : "❌"} | <@${item.uid}>: \`${hours}:${minutes}:${seconds}\``
            }
        })

        const description = (await Promise.all(dPromise)).join("\n")
        embed.setDescription(description)
        
        await db.client.connect()
        await db.collections.users.updateMany({ quota: { $exists: 1 } }, {"$set": {
            quota: 0
        }})
        await db.client.close()

        interaction.reply({content: "Quota has ben reset", embeds: [embed]})
	},
};