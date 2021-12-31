const { GoogleSpreadsheet } = require('google-spreadsheet');
const Discord = require("discord.js");
module.exports = {
	data: {
		name: "recommend_get",
		description: "おすすめ曲をランダムで1曲返します",
	},
	async execute(interaction, credentials) {
		const doc = new GoogleSpreadsheet('1zEJ5u2OmX9LLRyf_OFs3NT5sqClMr8wWN2CY9_uJKC4');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

		const Sheet = await doc.sheetsById[0];
    const Rows = await Sheet.getRows();

    const num = Math.floor(Math.random() * Rows.length);
    const embed = new Discord.MessageEmbed()
      .setTitle(`${Rows[num].title} / ${Rows[num].artist}`)
      .setDescription(`初出: ${Rows[num].game}\n音源: ${Rows[num].url}`)
		await interaction.reply({ embeds: [embed] });
	},
};