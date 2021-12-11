const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { user } = require("pg/lib/defaults");

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

async function finish_match(room, doc, client) {
  const leagues = ["B", "A", "S"];
  const rank_so = [18, 6, -6, -18];
  const rank_name = ["1st", "2nd", "3rd", "4th"]
  const users = []
  for(let i = 1; i <= 4; i++) {
    const user = await get_data(room["id" + i], doc)
    user.rate = parseInt(user.rate);
    users.push(user);
  }
  for(let i = 0; i < 4; i++) {
    let rank = 0
    let rank_ka = 0
    const i2 = i + 1
    for (let j = 1; j <= 4; j++) {
      if(parseInt(room["points" + i2]) < parseInt(room["points" + j])) {
        rank += 1
      }
      if(parseInt(users[i].rate) < parseInt(users[j - 1].rate)) {
        rank_ka += 2
      }
      rank_ka = Math.max(-4, Math.min(4, rank_ka));
    }
    const rank_p = rank_so[rank] + rank_ka;
    users[i].rate = Math.min(Math.max(0, parseInt(users[i].rate) + rank_p), 100);
    if (parseInt(users[i].rate) == 100 && leagues.indexOf(users[i].league) != leagues.length - 1) {
      const embed = await new Discord.MessageEmbed()
        .setImage(`https://raw.githubusercontent.com/HIRO15254/kyopro_otoge_bot/master/images/gauge${parseInt(users[i].rate)}.png`)
        .setTitle('Result')
        .setDescription(`あなたは${rank + 1}位になり、リーグ${leagues[leagues.indexOf(users[i].league) + 1]}に昇格しました!\nYou got ${rank_name[rank]} place, and you promoted to league rank ${leagues[leagues.indexOf(users[i].league) + 1]}!`);
      const user = await client.users.cache.get(users[i].id);
      await user.send({
        embeds: [embed]
      });
      users[i].league = leagues[leagues.indexOf(users[i].league) + 1]
      users[i].rate = 24
    }
    else if (parseInt(users[i].rate) == 0 && leagues.indexOf(users[i].league) != 0) {
      const embed = await new Discord.MessageEmbed()
        .setImage(`https://raw.githubusercontent.com/HIRO15254/kyopro_otoge_bot/master/images/gauge${parseInt(users[i].rate)}.png`)
        .setTitle('Result')
        .setDescription(`あなたは${rank + 1}位になり、リーグ${leagues[leagues.indexOf(users[i].league) - 1]}に降格しました...\nYou got ${rank_name[rank]} place, and you demoted to league rank ${leagues[leagues.indexOf(users[i].league) - 1]}...`);
      const user = await client.users.cache.get(users[i].id);
      await user.send({
        embeds: [embed]
      });
      users[i].league = leagues[leagues.indexOf(users[i].league) - 1]
      users[i].rate = 76;
    }
    else{
      const embed = await new Discord.MessageEmbed()
        .setImage(`https://raw.githubusercontent.com/HIRO15254/kyopro_otoge_bot/master/images/gauge${parseInt(users[i].rate)}.png`)
        .setTitle('Result')
        .setDescription(`あなたは${rank + 1}位になり、昇格まで${100 - parseInt(users[i].rate)}%です。\nYou got ${rank_name[rank]} place, and ${100 - parseInt(users[i].rate)}% to promote.`);
      const user = await client.users.cache.get(users[i].id);
      await user.send({
        embeds: [embed]
      });
    }
    await users[i].save();
  }
}

exports.result = async function(interaction, doc, client) {
  const sheet = await doc.sheetsById[2021610226];
  const rooms = await sheet.getRows();
  const player = await get_data(interaction.user.id, doc);
  const points = interaction.options.getInteger('points')
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