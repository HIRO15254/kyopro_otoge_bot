const Discord = require("discord.js");
module.exports = {
	data: {
		name: "recommend_link",
		description: "おすすめ曲データベースのリンクを返します",
	},
	async execute(interaction, credentials) {
		await interaction.reply({
			content: 'おすすめ楽曲のデータ一覧はhttps://docs.google.com/spreadsheets/d/1zEJ5u2OmX9LLRyf_OFs3NT5sqClMr8wWN2CY9_uJKC4/edit?usp=sharing から閲覧、編集が可能です',
			ephemeral: true 
		});
	},
};