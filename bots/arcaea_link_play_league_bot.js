const { Client, Intents } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');

const guildIDs = ['917238912672485406', ];
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const commands = {};
const commandFileNames = [
  'arcaea_help.js',
  'arcaea_odai.js',
  'league_entry.js',
  'league_matching.js',
  'league_cancel.js',
  'league_result.js',
  'league_language.js',
  'league_info.js'
]
const commandFiles = fs.readdirSync('./commands').filter(file => {
  return commandFileNames.some(name => file.endsWith(name));
});

let credentials = "";
let token = "";

exports.awake = async function(test){
  if(test){
    token = await fs.readFileSync("./tokens/arcaea_link_play_league_bot.txt", 'utf8').toString();
    credentials = require('../credentials.json');
  }
  else{
    token = process.env.DISCORD_TOKEN_2;
    credentials = require("/app/google-credentials.json");
  }

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
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
    console.log('Ready! a');
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    const command = commands[interaction.commandName];

    await interaction.deferReply({
      ephemeral: true
    });
    try {
      await command.execute(interaction, data, client);
    }
    catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  });

  const doc = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();
  const loader = await require('../functions/league_load.js');
  const data = await loader.load(doc);

  client.login(token);
}