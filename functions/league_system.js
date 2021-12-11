const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

async function get_data(id, doc) {
  const sheet = await doc.sheetsById[0];
  const users = await sheet.getRows();
  return users.find(user => user.id == id);
}

function in_room(id, room) {
  return (room.id1 == id || room.id2 == id || room.id3 == id || room.id4 == id);
}

function add_result(player, room, points) {
  for(let i = 1; i <= 4; i++) {
    if(room['id' + i] == player.id){
      room['points' + i] = points;
      break;
    }
  }
  if (room.points1 && room.points2 && room.points3 && room.points4) {
    room.state = 'finished';
  }
}

function finish_match(room, doc, client) {
  for(let i = 1; i <= 4; i++) {
    
  }
}

exports.result = async function(interaction, doc, client) {
  const sheet = await doc.sheetsById[2021610226];
  const rooms = await sheet.getRows();
  const player = await get_data(interaction.user.id, doc);
  const points = interaction.options.getInteger('level')
  // 開始であった場合
  if(0 > points || 16 < points){
    return '値が不正です\ninvalid result';
  }
  if (rooms.some(room => room.state == 'playing' && in_room(player.id, room))) {
    const room = rooms.find(room => room.state === 'playing' && in_room(player.id, room));
    await add_result(player, room, points);
    if (room.state == 'finished') {
      await finish_match(room, doc, client)
    }
    await room.save()
    return "結果を記録しました\nSucessfully logged your result";
  }
  else {
    return "結果を記録する対象がありません\nThere is no match to log your result";
  }
}