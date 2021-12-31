const { Client, Intents } = require('discord.js');
const fs = require('fs');

const guildIDs = ['821604538338902091', '702851795717718066',];

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = {};
const commandFileNames = [
  'arcaea_help.js',
  'arcaea_odai.js',
  'recommend_get.js',
  'recommend_set.js',
  'recommend_link.js'
]
const commandFiles = fs.readdirSync('./common_commands').filter(file => {
  let ans = false;
  commandFileNames.forEach(name => {
    ans = ans || file.endsWith(name);
  });
  return ans;
});

let credentials = "";
let token = "";

exports.awake = async function (test) {
  if (test) {
    token = await fs.readFileSync("./tokens/kyopro_otoge_bot_token.txt", 'utf8').toString();
    credentials = require('../credentials.json');
  }
  else {
    token = process.env.DISCORD_TOKEN;
    credentials = require("/app/google-credentials.json");
  }

  for (const file of commandFiles) {
    const command = require(`../common_commands/${file}`);
    commands[command.data.name] = command;
  }

  client.once('ready', async () => {
    const data = [];
    for (const commandName in commands) {
      data.push(commands[commandName].data);
    }
    for (const id in guildIDs) {
      await client.application.commands.set(data, guildIDs[id]);
    }
    console.log('Ready! k');
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
}