const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
	data: {
		name: "matching",
		description: "start matching",
	},
	async execute(interaction, credentials) {
    const doc = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    const sheet = await doc.sheetsById[299741918];
    await sheet.loadCells('A1:A1');
		const now = await sheet.getCell(0, 0)
    console.log(now)

    if (now) {
      await interaction.reply({
        content: "start matching",
        ephemeral: true 
      });
    }
    else {
      await interaction.reply({
        content: "out of matching time now!",
        ephemeral: true 
      });
    }
	},
};