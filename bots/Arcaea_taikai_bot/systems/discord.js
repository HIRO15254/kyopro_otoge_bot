//@ts-check
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const path = require('path');

/** @type {Array<string>} サーバーのID */
const guildIDs = ['918371121131311145',];

/** @type {Client} Discordのクライアント */
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

/** @type {string} Discordのログイントークン */
let token;

/** @type {Array<string>} トーナメント用のコマンドファイルの一覧 */
const leagueCommandFiles = fs.readdirSync(path.resolve(__dirname, './../commands'));

/** @type {Array<string>} 読み込む汎用コマンドの名前一覧 */
const commonCommandFiles = [
  'arcaea_help.js',
  'arcaea_odai.js',
]

/** @type {*} コマンドファイルの中身一覧 */
const commands = {};

exports.road = async function () {
  try {
    token = fs.readFileSync("./tokens/arcaea_taikai_bot.txt", 'utf8').toString();
  }
  catch {
    token = process.env.DISCORD_TOKEN_3;
  }

  // コマンド一覧の取得
  for (const file of commonCommandFiles) {
    const command = require(`./../../../common_commands/${file}`);
    commands[command.data.name] = command;
  }
  for (const file of leagueCommandFiles) {
    const command = require(`./../commands/${file}`);
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
    console.log('Arcaea Taikai Bot is Ready!');
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
      return;
    }
    const command = commands[interaction.commandName];
    try {
      await command.execute(interaction);
    }
    catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'There was an error while executing this command!',
      });
    }
  });

  await client.login(token);
  return client;
}

exports.client = client;
