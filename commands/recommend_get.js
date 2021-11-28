const { GoogleSpreadsheet } = require('google-spreadsheet');
const Discord = require("discord.js");
module.exports = {
	data: {
		name: "recommend_get",
		description: "おすすめ曲をランダムで1曲返します",
	},
	async execute(interaction) {
		const doc = new GoogleSpreadsheet('1zEJ5u2OmX9LLRyf_OFs3NT5sqClMr8wWN2CY9_uJKC4');
    const credentials = require('../credentials.json');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

		const Sheet = await doc.sheetsById[0];
    const Rows = await Sheet.getRows();
    const num = Math.floor(Math.random() * Rows.length);
    const embed = new Discord.MessageEmbed()
      .setTitle(`${Rows[num].title} / ${Rows[num].artist}`)
      .setDescription(`初出: ${Rows[num].game} \n 音源: ${Rows[num].url}`)
      .setColor('RANDOM')
		await interaction.reply({ embeds: [embed] });
	},
};