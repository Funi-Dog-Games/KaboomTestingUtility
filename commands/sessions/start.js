const { SlashCommandBuilder, ThreadAutoArchiveDuration, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const db = require("../../modules/db.js")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Start a session'),
    async execute(interaction) {
        await db.client.connect()
        const thr = await db.collections.threads.findOne({ uid: interaction.user.id, active: true })
        if(thr) return interaction.reply(`You already have an active session in thread <#${thr.tid}>`)

		await interaction.deferReply();
        const sentMsg = await interaction.editReply("Session Started!");

        const thread = await sentMsg.startThread({
            name: `${interaction.user.username}'s Session`,
            autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
            reason: `${interaction.user.username} has been inactive for 1 hour!`
        });

        await db.collections.threads.insertOne({ uid: interaction.user.id, tid: thread.id, active: true })
        await db.client.close()

        const endButton = new ButtonBuilder()
        .setCustomId("end")
        .setLabel("End")
        .setStyle(ButtonStyle.Danger)

        const actionRow = new ActionRowBuilder()
        .addComponents([endButton])

        const reply = await thread.send({ content: `<@${interaction.user.id}>, while you work, post images or summaries of what you're doing!`, components: [actionRow] })
        const buttonClick = await reply.awaitMessageComponent()
        if(buttonClick.user.id == interaction.user.id){
            if(buttonClick.customId == "end"){
                await buttonClick.update({ content: "Session over! Great job!", components: [] })
                await thread.setLocked(true)
                await db.client.connect()

                db.collections.threads.updateOne({uid: interaction.user.id, active: true}, {"$set": {
                    uid: interaction.user.id,
                    tid: thread.id,
                    active: false
                }})

                await db.client.close()
            }
        }else {
            buttonClick.reply({ content: `These buttons aren't for you!`, ephemeral: true });
        }
	},
};