const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

const data = require("../systems/data.js").data;

/** @type {{[id: string]: {'japanese': string, 'english': string} }} */
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
	/** @param {Discord.CommandInteraction} interaction */
	async execute(interaction) {
		await interaction.deferReply({
      ephemeral: true
    });
		if(!Object.keys(data.players).some(id => id === interaction.user.id))
		{
			await interaction.editReply({
        content: returns.notentried.japanese + '\n' + returns.notentried.english,
      });
		}
		else{
      const player = data.players[interaction.user.id];
			const language = interaction.options.getString('language');
      player.language = language;
			await player.save();

			await interaction.editReply({
        content: replies.accept[language],
      });
		}
	},
};