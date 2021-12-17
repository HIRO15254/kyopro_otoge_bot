const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

function initial_rank(potential) {
	if (potential < 11.00) { return 'B-'; }
	if (potential < 11.35) { return 'B'; }
	if (potential < 11.65) { return 'B+'; }
	if (potential < 12.00) { return 'A-'; }
	if (potential < 12.15) { return 'A'; }
	if (potential < 12.35) { return 'A+'; }
	if (potential < 12.60) { return 'S-'; }
	if (potential < 12.80) { return 'S'; }
	return 'S+';
}

module.exports = {
	data: {
		name: "entry",
		description: "entry to league (only first time)",
		options: [
			{
				type: "NUMBER",
				name: "potential",
        required: true,
				description: "potintial now (used to decide first league rank)",
			},
			{
				type: "STRING",
				name: "language",
        required: true,
				description: "your language",
				choices: [
					{ name: "Japanese", value: "japanese" },
					{ name: "English", value: "english" },
				]
			},
		]
	},
	async execute(interaction, data, client) {
		const replies = {
			'alreadyentried': {
				'japanese': '既にエントリーしています',
				'english': 'You have already entried.'
			},
			'accept': {
				'japanese': '受け付けました!',
				'english': 'accepted!'
			},
		}
		if(data.players.some(player => player.id === interaction.user.id))
		{
			await interaction.editReply({
        content: replies.alreadyentried[data.players.find(player => player.id === interaction.user.id).language],
      });
		}
		else{
			const potential = interaction.options.getNumber('potential');
			const language = interaction.options.getString('language');
			const player = await data.players[0]._sheet.addRow({
				'potential': potential,
				'language': language,
				'id': interaction.user.id,
				'name': interaction.user.username,
				'rank': initial_rank(potential),
				'rate': 25,
			});
			data.players.push(player);

			await interaction.editReply({
        content: replies.accept[language],
      });
		}
	},
};