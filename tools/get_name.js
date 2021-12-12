const { Client, Intents } = require('discord.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');

async function a() {
  const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
  const credentials = require('../credentials.json');

  const doc = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');
  await doc.useServiceAccountAuth(credentials);
  await doc.loadInfo();

  // プレイヤー情報の読み込み
  const playersheet = doc.sheetsById[0];
  const players = await playersheet.getRows();

  const token = fs.readFileSync("./tokens/arcaea_link_play_league_bot.txt", 'utf8').toString();
  client.login(token);

  players.forEach(player => {
    const user = client.users.cache.get(player.id);
    console.log(user);
  });
}

a();
