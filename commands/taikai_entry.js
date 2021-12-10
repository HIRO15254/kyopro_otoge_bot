const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
	data: {
		name: "entry",
		description: "entry to league (only first time)",
		options: [
			{
				type: "STRING",
				name: "arcaea_name",
        required: true,
				description: "Arcaea上におけるプレイヤーネーム",
			},
      {
				type: "NUMBER",
				name: "potential",
        required: true,
				description: "Arcaeaのポテンシャル値",
			},
		]
	},
	async execute(interaction, credentials) {
    const doc = new GoogleSpreadsheet('1fM6kXEjpH4BYmbgP0slfsYCMBdbYc0DfsXSCfNFxbzs');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

    const Sheet = await doc.sheetsById[0];
    const arcaea_name = interaction.options.getString('arcaea_name');
		const potential = interaction.options.getNumber('potential');
		const Rows = await Sheet.getRows();
		if(Rows.some(u => u.user_id == interaction.member.user.id))
		{
			await interaction.reply({
				content: "既にエントリーしています!",
			});
		}
		else{
			await Sheet.addRow({
				'potential': potential,
        'arcaea_name': arcaea_name,
				'user_id': interaction.member.user.id,
        'discord_name': interaction.member.user.username,
			});

			await interaction.reply({
				content: "受け付けました!", 
			});
		}
	},
};