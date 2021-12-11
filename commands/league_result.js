const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
	data: {
		name: "result",
		description: "report your result",
    options: [
			{
				type: "INTEGER",
				name: "points",
        required: true,
				description: "your points of this match",
			},
		]
	},
	async execute(interaction, credentials, client) {
    const doc = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    const system = await require('../functions/league_system.js');

    await interaction.deferReply({
      ephemeral: true
    });
    const rep = await system.result(interaction, doc, client)
    await interaction.editReply({
      content: rep,
    });
	},
};