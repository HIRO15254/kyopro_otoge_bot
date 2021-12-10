const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

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
		]
	},
	async execute(interaction, credentials) {
    const doc = new GoogleSpreadsheet('1ZpZ2beBEjW0B2SxAS2TZT4f1UDl5LOkt8CjX71eHIs4');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    const Sheet = await doc.sheetsById[0];
		const potential = interaction.options.getNumber('potential');
		const Rows = await Sheet.getRows();
		if(Rows.some(u => u.id === interaction.member.user.id))
		{
			await interaction.reply({
				content: "既にエントリーしています!\nYou have already registrated!",
				ephemeral: true 
			});
		}
		else{
			await Sheet.addRow({
				'potential': potential,
				'id': interaction.member.user.id,
			});

			await interaction.reply({
				content: "受け付けました!\naccepted!",
				ephemeral: true 
			});
		}
	},
};