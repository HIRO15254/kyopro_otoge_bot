const { GoogleSpreadsheet } = require('google-spreadsheet');
module.exports = {
	data: {
		name: "recommend_add",
		description: "おすすめ曲を登録します",
		options: [
			{
				type: "STRING",
				name: "title",
				description: "楽曲のタイトル",
				required: true
			},
			{
				type: "STRING",
				name: "artist",
				description: "アーティスト",
			},
			{
				type: "STRING",
				name: "game",
				description: "初出のゲーム",
			},
			{
				type: "STRING",
				name: "url",
				description: "音源URL",
			},
		]
	},
	async execute(interaction) {
		const doc = new GoogleSpreadsheet('1zEJ5u2OmX9LLRyf_OFs3NT5sqClMr8wWN2CY9_uJKC4');
    const credentials = require('../credentials.json');
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();

		const title = interaction.options.getString('title');
		const artist = interaction.options.getString('artist');
		const game = interaction.options.getString('game');
		const url = interaction.options.getString('url');

		const sheet = await doc.sheetsById[0];
		await sheet.addRow({
			title: title,
			artist: artist,
			game: game,
			url: url,
		});

		await interaction.reply({
			content: '保存しました！',
			ephemeral: true 
		});
	},
};