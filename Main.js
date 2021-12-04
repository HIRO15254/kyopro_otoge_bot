const { Client, Intents } = require('discord.js');
const fs = require('fs');
const token = process.env.DISCORD_TOKEN;
const guildID = process.env.GUILD_ID;
// const clientID = process.env.CLIENT_ID;

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    sslmode: 'require',
    rejectUnauthorized: false
  }
});

const credentials = require("/app/google-credentials.json");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = {};
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands[command.data.name] = command;
}

client.once('ready', async () => {
	const data = [];
	for (const commandName in commands) {
		data.push(commands[commandName].data);
	}
	await client.application.commands.set(data);
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) {
		return;
	}
	const command = commands[interaction.commandName];
	try {
		await command.execute(interaction, credentials);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({
			content: 'There was an error while executing this command!',
			ephemeral: true,
		});
	}
});

client.login(token);