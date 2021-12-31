//@ts-check
const Discord = require("discord.js");

const data = require("./../systems/data.js").data;
const Rank = require("./../classes/Rank.js");
const Player = require("./../classes/Player.js");

/** @type {{[id: string]: {'japanese': string, 'english': string} }} */
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
	/** @param {Discord.CommandInteraction} interaction */
	async execute(interaction) {
		await interaction.deferReply({
			ephemeral: false,
		});

		const potential = interaction.options.getNumber('potential');
		const language = interaction.options.getString('language');

		if(Object.keys(data.players).some(id => id == interaction.user.id))
		{
			await interaction.editReply({
        content: replies.alreadyentried[data.players[interaction.user.id].language],
      });
		}
		else{
			data.players[interaction.user.id] = await Player.create(interaction.user.id, interaction.user.username, language, Rank.GetInitialRank(potential) );
			data.players[interaction.user.id].reset_role();

			await interaction.editReply({
        content: replies.accept[language],
      });
		}
	},
};