const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

// ランクと番号の対応
const ranks = {
  'B-': 0,
  'B': 1,
  'B+': 2,
  'A-': 3,
  'A': 4,
  'A+': 5,
  'S-': 6,
  'S': 7,
  'S+': 8
}

function in_room(id, room) {
  return (room.id1 == id || room.id2 == id || room.id3 == id || room.id0 == id);
}

function add_result(player, room, points) {
  for(let i = 0; i < 4; i++) {
    if(room['id' + i] == player.id){
      room['point' + i] = points;
      break;
    }
  }
  if (room.point0 && room.point1 && room.point2 && room.point3) {
    room.state = 'finished';
  }
}

async function finish_match(room, data, client) {
  const place_name = ["1st", "2nd", "3rd", "4th"];
  const room_players = []
  for(let i = 0; i < 4; i++) {
    const player = await data.players.find(user => user.id == room['id' + i]);
    room_players.push(player);
  }
  for(let i = 0; i < 4; i++) {
    let rate = 12
    let rank = 1
    for (let j = 0; j < 4; j++) {
      if(parseInt(room["point" + i]) < parseInt(room["point" + j])) {
        rank += 1
        rate -= 6
      }
      else if(parseInt(room["point" + i]) == parseInt(room["point" + j])) {
        rate -= 3
      }
      rate += ranks[room_players[j].rank] - ranks[room_players[i].rank]
    }
    room_players[i].rate = Math.min(Math.max(0, parseInt(room_players[i].rate)) + rate, 50);
    let description = '';
    if (parseInt(room_players[i].rate) == 50 && ranks.indexOf(room_players[i].rank) != ranks.length - 1) {
      if (room_players[i].language == 'japanese') {
        description = `あなたは${rank}位になり、ランク${ranks[ranks.indexOf(users[i].rank) + 1]}に昇格しました!`
      }
      else{
        description = `You got ${place_name[rank]} place, and you promoted to league rank ${ranks[ranks.indexOf(room_players[i].rank) + 1]}!`
      }
      room_players[i].rank = ranks[ranks.indexOf(room_players[i].rank) + 1];
      room_players[i].rate = 10;
    }
    else if (parseInt(room_players[i].rate) == 0 && ranks.indexOf(room_players[i].rank) != 0) {
      if (room_players[i].language == 'japanese') {
        description = `あなたは${rank}位になり、ランク${ranks[ranks.indexOf(users[i].rank) - 1]}に降格しました...`
      }
      else{
        description = `You got ${place_name[rank]} place, and you deomoted to league rank ${ranks[ranks.indexOf(room_players[i].rank) - 1]}...`
      }
      room_players[i].rank = ranks[ranks.indexOf(room_players[i].rank) - 1];
      room_players[i].rate = 40;
    }
    else {
      if (room_players[i].language == 'japanese') {
        description = `あなたは${rank}位になり、昇格まで${100 - parseInt(room_players[i].rate) * 2}%です`
      }
      else{
        description = `You got ${place_name[rank]} place, ${100 - parseInt(room_players[i].rate) * 2}% to promote.`
      }
    }
    await room_players[i].save();
    const embed = await new Discord.MessageEmbed()
      .setImage(`https://raw.githubusercontent.com/HIRO15254/kyopro_otoge_bot/master/images/gauge${parseInt(room_players[i].rate)}.png`)
      .setTitle('Result')
      .setDescription(description);
    const user = await client.users.fetch(room_players[i].id);
    await user.send({
      embeds: [embed]
    });
  }
}

exports.result = async function(interaction, data, client) {
  const texts = {
    'invalid': {
      'japanese': '値が不正です',
      'english': 'invalid result',
    },
    'logged': {
      'japanese': '結果を記録しました',
      'english': 'Sucessfully logged your result'
    },
    'nomatch': {
      'japanese': '結果を記録する対象がありません',
      'english': 'There is no match to log your result'
    }
  }
  const member = interaction.options.getUser('member');
  let player = ''
  if (!member) {
    player = await data.players.find(user => user.id == interaction.user.id);
  }
  else {
    player = await data.players.find(user => user.id == member.id);
  }
  const point = interaction.options.getInteger('point');

  if(0 > point || 16 < point){
    return texts.invalid[player.language];
  }
  if (data.rooms.some(room => room.state == 'playing' && in_room(player.id, room))) {
    const room = data.rooms.find(room => room.state === 'playing' && in_room(player.id, room));
    add_result(player, room, point);
    if (room.state == 'finished') {
      await finish_match(room, data, client);
    }
    await room.save()
    return texts.logged[player.language];
  }
  else {
    return texts.nomatch[player.language];
  }
}