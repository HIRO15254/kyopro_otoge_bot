//@ts-check
const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

const data = require("../systems/data.js").data;
const Room = require("./../classes/Room.js");
const Player = require("./../classes/Player.js");

const replies = {
	'notentried': {
    'japanese': '`/entry`コマンドを使用して先にエントリーを行ってください',
    'english': 'You have to use `/entry` command before using this command.'
  },
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

module.exports = {
	data: {
		name: "result",
		description: "report your result",
    options: [
			{
				type: "INTEGER",
				name: "point",
        required: true,
				description: "your points of this match",
			},
      {
				type: "USER",
				name: "member",
				description: "if you want to report other members points, set this",
			},
		]
	},
	async execute(interaction) {
		await interaction.deferReply({
      ephemeral: false
    });
		const point = interaction.options.getInteger('point');
		const member = interaction.options.getUser('member');
		let player_id;
		if (!member) { player_id = interaction.user.id; }
		else { player_id = member.id; }

		//エントリーしていない
    if(!Object.keys(data.players).some(id => id == player_id))
		{
			await interaction.editReply({
        content: replies.notentried.japanese + '\n' + replies.notentried.english,
      });
      return;
		}

		const player = data.players[player_id];

		if(0 > point || 16 < point){
			await interaction.editReply({
        content: replies.invalid[player.language],
      });
      return;
		}

		if (!data.rooms.some(room => room.state == 'playing' && room.in_room(player))) {
			await interaction.editReply({
        content: replies.nomatch[player.language],
      });
      return;
		}

		const room = data.rooms.find(room => room.state == 'playing' && room.in_room(player));
		await room.add_result(player, point);
		await interaction.editReply({
			content: replies.logged[player.language],
		});
		return;
	},
};