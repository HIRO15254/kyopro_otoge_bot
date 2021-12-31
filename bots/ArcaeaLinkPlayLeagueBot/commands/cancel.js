//@ts-check
const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

const data = require("../systems/data.js").data;
const Room = require("./../classes/Room.js");

const replies = {
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

module.exports = {
	data: {
		name: "cancel",
		description: "cancel waiting for match",
	},
  /** @param {Discord.CommandInteraction} interaction */
	async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    });

    if(!Object.keys(data.players).some(id => id == interaction.user.id))
		{
			await interaction.editReply({
        content: replies.notentried.japanese + '\n' + replies.notentried.english,
      });
      return;
		}

    const player = data.players[interaction.user.id];

    // matching状態にそのプレイヤーがいない
    if (!data.rooms.some(room => room.state == 'matching' && room.in_room(player))) {
      await interaction.editReply({
        content: replies.notmathingnow[player.language],
      });
      return;
    }

    const room = data.rooms.find(room => room.state == 'matching' && room.in_room(player));
    if (await room.remove(player)) {
      data.rooms.splice(data.rooms.indexOf(room), 1)
    }
    await interaction.editReply({
      content: replies.cancelmatching[player.language],
    })
	},
};