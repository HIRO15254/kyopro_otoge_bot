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
			});
		}
		else{
			let league = '';
			let rate = 0;
			if (potential < 11.65) {
				league = 'B';
				rate = Math.max(24, Math.min(100 - (11.65 - potential) * 100, 74));
			}
			else if (potential < 12.35) {
				league = 'A';
				rate = Math.max(24, Math.min(50 - (12 - potential) * 100, 74));
			}
			else{
				league = 'S';
				rate = 24 + (potential - 12.35) * 100
			}
			await Sheet.addRow({
				'potential': potential,
				'id': interaction.member.user.id,
				'league': league,
				'rate': rate,
			});

			await interaction.reply({
				content: "受け付けました!\naccepted!", 
			});
		}
	},
};