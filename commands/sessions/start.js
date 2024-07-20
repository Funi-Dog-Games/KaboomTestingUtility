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

        var startTime = Date.now()
        await db.collections.threads.insertOne({ 
            uid: interaction.user.id, 
            tid: thread.id, 
            startTime,
            active: true, 
            channel: interaction.channel.id 
        })
        
        await db.client.close()

        const endButton = new ButtonBuilder()
        .setCustomId("end")
        .setLabel("End")
        .setStyle(ButtonStyle.Danger)

        const actionRow = new ActionRowBuilder()
        .addComponents([endButton])

        const reply = await thread.send({ content: `<@${interaction.user.id}>, while you work, post images or summaries of what you're doing!`, components: [actionRow] })
        async function connect(){
            const buttonClick = await reply.awaitMessageComponent()

            await db.client.connect()
            const isReviewer = await db.collections.reviewers.findOne({ uid: buttonClick.user.id }) != undefined
            await db.client.close()

            if(buttonClick.user.id == interaction.user.id || isReviewer){
                if(buttonClick.customId == "end"){
                    await thread.setLocked(true)
                    await db.client.connect()

                    await db.collections.threads.updateOne({uid: interaction.user.id, active: true}, {"$set": {
                        uid: interaction.user.id,
                        tid: thread.id,
                        startTime: startTime,
                        endTime: Date.now(),
                        active: false,
                        reviewing: false,
                        reviewed: false
                    }})

                    if(isReviewer && interaction.user.id != buttonClick.user.id){
                        buttonClick.channel.send("A reviewer has ended your session.")
                    }
                    
                    const minutes = Math.floor((Date.now() - startTime) / (1000 * 60)).toString().padStart(2, '0');
                    const seconds = Math.floor(((Date.now() - startTime) / 1000) % 60).toString().padStart(2, '0');

                    await buttonClick.reply(`Great job! You're done! You worked for \`${minutes}:${seconds}\``);
                    await db.client.close()
                } else {
                    return connect()
                }
            } else {
                buttonClick.reply({ content: `These buttons aren't for you!`, ephemeral: true });
                return connect()
            }
        }

        connect()
	},
};