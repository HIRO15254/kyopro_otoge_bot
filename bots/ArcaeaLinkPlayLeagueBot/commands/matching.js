//@ts-check
const data = require("../systems/data.js").data;
const Room = require("./../classes/Room.js");

/** @type {{[id: string]: {'japanese': string, 'english': string} }} */
const replies = {
  'notentried': {
    'japanese': '`/entry`コマンドを使用して先にエントリーを行ってください',
    'english': 'You have to use `/entry` command before using this command.'
  },
  'mathingnow': {
    'japanese': '既にマッチングを行っています',
    'english': 'You have already been waiting for make match or playing!'
  },
  'playingnow': {
    'japanese': 'まだ前回の試合の結果を全員が報告していません',
    'english': 'Some of your opponents or you have not logged result yet'
  },
  'startmatching': {
    'japanese': 'マッチングを開始しました',
    'english': 'Successfully startded waiting for make match'
  },
  'outoftime': {
    'japanese': '開催時間外です',
    'english': 'out of mathing time now'
  }
}

module.exports = {
	data: {
		name: "matching",
		description: "start waiting for match",
	},
	async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    });

    //エントリーしていない
    if(!Object.keys(data.players).some(id => id == interaction.user.id))
		{
			await interaction.editReply({
        content: replies.notentried.japanese + '\n' + replies.notentried.english,
      });
      return;
		}

    const player = data.players[interaction.user.id];

    // マッチング時間外である
    /** @type {Date} 現在時刻 */
    const now = new Date()
    if (!data.schedules.some(schedule => schedule.holding(now)))
    {
      await interaction.editReply({
        content: replies.outoftime[player.language]
      });
      return;
    }

    // どれかのルームに参加している
    if (data.rooms.some(room => room.in_room(player) && room.state == 'matching')) {
      await interaction.editReply({
        content: replies.mathingnow[player.language]
      });
      return;
    }

    // 結果報告が済んでいない
    if (data.rooms.some(room => room.in_room(player) && room.state == 'playing')) {
      await interaction.editReply({
        content: replies.playingnow[player.language]
      });
      return;
    }

    // 参加できるルームがあるか
    if (data.rooms.some(room => room.can_join(player))) {
      const room = data.rooms.find(room => room.can_join(player));
      await room.add(player);
    }
    else{
      data.rooms.push(await Room.create(data.rooms.length + 1, player));
    } 
    await interaction.editReply({
      content: replies.startmatching[player.language],
    });
	},
};