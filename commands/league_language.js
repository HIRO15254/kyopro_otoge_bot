const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
	data: {
		name: "language",
		description: "change your language",
		options: [
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
			'notentried': {
        'japanese': '`/entry`コマンドを使用して先にエントリーを行ってください',
        'english': 'You have to use `/entry` command before using this command.'
      },
			'accept': {
				'japanese': '受け付けました!',
				'english': 'accepted!'
			},
		}
		if(!data.players.some(player => player.id === interaction.user.id))
		{
			await interaction.editReply({
        content: returns.notentried.japanese + '\n' + returns.notentried.english,
      });
		}
		else{
      const player = data.players.find(player => player.id === interaction.user.id);
			const language = interaction.options.getString('language');
      player.language = language;
			player.save();

			await interaction.editReply({
        content: replies.accept[language],
      });
		}
	},
};