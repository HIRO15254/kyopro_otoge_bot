const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.load = async function(doc) {
  // プレイヤー情報の読み込み
  const playersheet = await doc.sheetsById[0];
  const players = await playersheet.getRows();
  players.forEach(player => {
    player.potential = parseFloat(player.potential);
    player.rate = parseInt(player.rate);
  });

  // ルーム情報の読み込み
  const roomsheet = await doc.sheetsById[2021610226];
  const rooms = await roomsheet.getRows();
  rooms.forEach(room => {
    room.num = parseInt(room.num);
    for(let i = 0; i < 4; i++) {
      room['point' + i] = parseInt(room['point' + i]);
    }
  });

  // 開催時間情報の読み込み
  const schedulesheet = await doc.sheetsById[299741918];
  const schedules = await schedulesheet.getRows();

  return {
    'players': players,
    'rooms': rooms,
    'schedules': schedules,
  }
}