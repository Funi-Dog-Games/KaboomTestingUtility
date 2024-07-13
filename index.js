// Remember to change deploy-commands back to gloabl scope
const Discord = require("discord.js")

const express = require('express')
const bodyParser = require('body-parser');
const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(process.env.PORT || 3500)

const fs = require('fs')
const path = require('path')
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.MessageContent] })
app.client = client
require("dotenv").config()
client.commands = new Discord.Collection()

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`⚠️ | The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

const apiPath = path.join(__dirname, "api")
const apiFiles = fs.readdirSync(apiPath).filter(file => file.endsWith('.js'))

for (const file of apiFiles) {
    const filePath = path.join(apiPath, file)
    const data = require(filePath)(app)
    if(data.method && data.route){
        console.log(`✅ | API route ${data.method} '${data.route}' has been setup successfully`)
    } else {
        console.log(`❌ | API route '${filePath}' did not return data.method or did not return data.route`)
    }
}

require("./modules/deploy-commands")()
require("./modules/db.js").run()


client.login(process.env.TOKEN)