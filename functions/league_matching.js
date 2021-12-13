const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

const ranks = ['B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+']

/**
 * 現在そのルームにいるか
 * @param {*} id プレイヤーのid
 * @param {*} room 判定対象のルーム
 * @returns 現在そのルームにいるか
 */
function in_room_now(id, room) {
  if (room.state === 'finished') {
    return false;
  }
  let ret = false;
  for(let i = 0; i < 4; i++) {
    ret = ret || (room['id' + i] == id && !room['point' + i])
  }
  return ret;
}

/**
 * そのルームに参加していた、またはいるか
 * @param {*} id プレイヤーのid
 * @param {*} room 判定対象のルーム
 * @returns そのルームに参加していた/いるか
 */
function in_room(id, room) {
  let ret = false;
  for(let i = 0; i < 4; i++) {
    ret = ret || (room['id' + i] == id)
  }
  return ret;
}

function remove_from_room(player, room) {
  if(room.id1 == player.id) {
    room.id1 = room.id2 || '';
    room.id2 = room.id3 || '';
    room.id3 = '';
  }
  else if(room.id2 == player.id) {
    room.id2 = room.id3 || '';
    room.id3 = '';
  }
  else if(room.id3 == player.id) {
    room.id3 = '';
  }
}

/**
 * 今回これまでに一緒の部屋でプレイしているか
 * @param {string} id1 
 * @param {string} id2 
 * @param {*} rooms 
 * @returns 
 */
function hasplayed(id1, id2, rooms){
  if (id1 == id2) {
    return 0;
  }
  return rooms.filter(room => in_room(id1, room) && in_room(id2, room) && room.state != 'matching').length
}

/**
 * そのルームに参加することができるか
 * @param {*} player 参加しようとしているプレイヤー
 * @param {*} room 参加できるか判定するルーム
 * @param {*} data Google Spread Sheetから読み込んだデータ
 * @returns 参加できるか
 */
function canjoin(player, room, data) {
  if (room.state != 'matching') {
    return false;
  }
  if (room.rank2) {
    if (room.rank0 != player.rank && room.rank1 != player.rank && room.rank2 != player.rank) {
      return false;
    }
  }
  else if (room.rank1) {
    if (Math.abs(ranks.indexOf(room.rank0) - ranks.indexOf(player.rank)) > 1 && Math.abs(ranks.indexOf(room.rank1) - ranks.indexOf(player.rank)) > 1) {
      return false;
    }
  }
  else {
    if (Math.abs(ranks.indexOf(room.rank0) - ranks.indexOf(player.rank)) > 1) {
      return false;
    }
  }
  let p = 0
  for(let i = 0; i < 3; i++) {
    p += hasplayed(player.id, room['id' + i], data.rooms);
    if (p >= 2) { return false; }
  }
  return true;
}

/**
 * ルームにプレイヤーを参加させる
 * @param {*} player 参加するプレイヤー
 * @param {*} room 参加するルーム
 */
function add_to_room(player, room) {
  for(let i = 1; i < 4; i++) {
    if(!room['id' + i]){
      room['id' + i] = player.id;
      break;
    }
  }
  for(let i = 0; i < 3; i++) {
    if(!room['rank' + i]) {
      room['rank' + i] = player.rank;
    }
    if(player.rank == room['rank' + i]) {
      break;
    }
  }
  if (room.id3) {
    room.state = 'playing';
  }
}

async function start_playing(room, guild, client, data) {
  const texts = {
    'description': {
      'japanese': '試合の準備ができました。タイトルのリンクから試合用チャンネルへ移動できます。',
      'english': 'Your match is ready to start! Click the title to jump to match text channel.',
    }
  }
  const channel = await guild.channels.create(`room_${room.num}`, { parent: '919059123738402837', permissionOverwrites: [
    {id: '917238912672485406', deny: ['VIEW_CHANNEL']},
    {id: room.id0, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
    {id: room.id1, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
    {id: room.id2, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
    {id: room.id3, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
  ]});
  const invite = await channel.createInvite();
  for(let i = 0; i < 4; i++) 
  {
    const player = await data.players.find(user => user.id == room['id' + i]);
    const embed = await new Discord.MessageEmbed()
      .setTitle('Are you ready?')
      .setURL(invite.url)
      .setDescription(texts.description[player.language]);
    const user = await client.users.fetch(player.id);
    await user.send({
      embeds: [embed]
    });
  }
} 

function new_room(player, data){
  return {
    'num': data.rooms.length,
    'state': 'matching',
    'rank0': player.rank,
    'id0': player.id,
  }
}

/**
 * マッチングを開始する
 * @param {*} interaction この関数を呼び出したコマンドのインタラクション
 * @param {*} data Google Spread Sheetから読み込んだデータ
 * @param {*} client Discordのクライアント
 * @returns 返答の文面
 */
exports.matching = async function(interaction, data, client) {
  const returns = {
    'notentried': {
      'japanese': '`/entry`コマンドを使用して先にエントリーを行ってください',
      'english': 'You have to use `/entry` command before using this command.'
    },
    'mathingnow': {
      'japanese': '既にマッチングを行っています',
      'english': 'You have already been waiting for make match or playing!'
    },
    'startmatching': {
      'japanese': 'マッチングを開始しました',
      'english': 'Successfully startded waiting for make match'
    }
  }
  const player = data.players.find(player => player.id == interaction.user.id);
  // プレイヤー一覧にそのプレイヤーがいない
  if (player === undefined) {
    return returns.notentried.japanese + '\n' + returns.notentried.english;
  }
  // どれかのルームに参加している
  if (data.rooms.some(room => in_room_now(player.id, room))) {
    return returns.mathingnow[player.language];
  }
  // 参加できるルームがあるか
  if (data.rooms.some(room => canjoin(player, room, data))) {
    const room = data.rooms.find(room => canjoin(player, room, data));
    await add_to_room(player, room);
    if (room.state == 'playing') {
      await start_playing(room, interaction.guild, client, data);
    }
    await room.save();
  }
  else{
    const newroom = await data.rooms[0]._sheet.addRow(new_room(player, data));
    data.rooms.push(newroom);
  }
  return returns.startmatching[player.language];
}

exports.cancel = async function(interaction, data, client) {
  const player = data.players.find(player => player.id == interaction.user.id);
  const returns = {
    'notentried': {
      'japanese': '`/entry`コマンドを使用して先にエントリーを行ってください',
      'english': 'You have to use `/entry` command before using this command.'
    },
    'notmathingnow': {
      'japanese': 'マッチングを行っていません',
      'english': `You don't have been waiting for make match yet`
    },
    'cancelmatching': {
      'japanese': 'マッチングをキャンセルしました',
      'english': 'Successfully canceled waiting for make match'
    }
  }
  // プレイヤー一覧にそのプレイヤーがいない
  if (player === undefined) {
    return returns.notentried.japanese + '\n' + returns.notentried.english;
  }
  // matching状態にそのプレイヤーがいない
  if (!data.rooms.some(room => room.state == 'matching' && in_room(player.id, room))) {
    return returns.notmathingnow[player.language];
  }
  const room = data.rooms.find(room => room.state == 'matching' && in_room(player.id, room));
  await remove_from_room(player, room);
  if (!room.id1) {
    data.rooms.some(function(v, i){
      if (v == room) data.rooms.splice(i,1);    
    });
    await room.delete();
  }
  else {
    await room.save();
  }
  return returns.cancelmatching[player.language];
}
