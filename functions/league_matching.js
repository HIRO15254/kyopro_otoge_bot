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

function add_to_room(player, room) {
  for(let i = 3; i > 0; i--) {
    if(room['id' + i]){
      room['id' + String(i + 1)] = player.id;
      break;
    }
  }
  if (room.id4) {
    room.state = 'playing';
  }
}

async function start_playing(room, guild, client) {
  const channel = await guild.channels.create(`league_${room.league}_room_${room.num}`, { parent: '919059123738402837', permissionOverwrites: [
    {id: room.id1, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
    {id: room.id2, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
    {id: room.id3, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
    {id: room.id4, allow: ['ADD_REACTIONS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS',],},
  ]});
  const invite = await channel.createInvite();
  const embed = await new Discord.MessageEmbed()
    .setTitle('Are you ready?')
    .setURL(invite.url)
    .setDescription("試合の準備ができました。タイトルのリンクから試合用チャンネルへ移動できます。\nYour match is ready to start! Click the title to jump to match text channel.");
  for(let i = 1; i <= 4; i++) 
  {
    const user = await client.users.cache.get(room['id' + i]);
    await user.send({
      embeds: [embed]
    });
  }
} 

function new_room(player){
  return {
    'state': 'matching',
    'league': player.league,
    'id1': player.id,
  }
}

exports.matching = async function(interaction, cancel, doc, client) {
  const timesheet = await doc.sheetsById[299741918];
  const times = await timesheet.getRows();
  if (times.some(time => time.now == 'TRUE')) {
    return 'リーグ戦時間外です\nnow league match is not avaliable';
  }
  const sheet = await doc.sheetsById[2021610226];
  const rooms = await sheet.getRows();
  const player = await get_data(interaction.user.id, doc);
  // 開始であった場合
  if (!cancel){
    // if (rooms.some(room => room.state != 'finished' && in_room(player.id, room))) {
    //  return '既にマッチングを行っています!\nYou have already been waiting for make match!'
    // }
    if (rooms.some(room => room.state == 'matching' && room.league == player.league)) {
      const room = rooms.find(room => room.state === 'matching' && room.league == player.league);
      await add_to_room(player, room);
      if (room.state == 'playing') {
        await start_playing(room, interaction.guild, client);
      }
      await room.save();
    }
    else{
      await sheet.addRow(new_room(player));
    }
    return "マッチングを開始しました\nstartded waiting for make match"
  }
  //キャンセルであった場合
  else {
    if (!rooms.some(room => room.state == 'matching' && in_room(player.id, room))) {
      return `マッチングを行っていません!\nYou don't have been waiting for make match yet!`
    }
    const room = rooms.find(room => room.state == 'matching' && in_room(player.id, room));
    await remove_from_room(player, room);
    if (!room.id1) {
      await room.delete();
    }
    else {
      await room.save();
    }
    return "マッチングをキャンセルしました\nsuccessfully canceled waiting for make match"
  }
}