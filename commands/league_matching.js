const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { recaptchaenterprise } = require("googleapis/build/src/apis/recaptchaenterprise");

module.exports = {
	data: {
		name: "matching",
		description: "start waiting for match",
	},
	async execute(interaction, credentials, client) {
    const doc = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    const match = await require('../functions/league_matching.js');

    await interaction.deferReply({
      ephemeral: true
    });
    const rep = await match.matching(interaction, false, doc, client)
    await interaction.editReply({
      content: rep,
    });
	},
};