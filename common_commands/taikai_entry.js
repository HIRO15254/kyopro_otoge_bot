const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { content_v2_1 } = require("googleapis");

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

    const Sheet = doc.sheetsById[0];
    const arcaea_name = interaction.options.getString('arcaea_name');
		const potential = interaction.options.getNumber('potential');
		const Rows = await Sheet.getRows();
    // console.log(interaction);
		if(Rows.some(u => u.user_id == interaction.user.id))
		{
			await interaction.reply({
				content: "既にエントリーしています!",
			});
		}
		else{
			await Sheet.addRow({
        'no': Rows.length + 1,
				'potential': potential,
        'arcaea_name': arcaea_name,
				'user_id': interaction.user.id,
        'discord_name': interaction.user.username,
			});
      await interaction.member.roles.add('918512305489207297');
			await interaction.reply({
				content: "受け付けました!", 
			});
		}
	},
};