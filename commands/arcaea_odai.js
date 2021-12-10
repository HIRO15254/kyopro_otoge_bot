const Discord = require("discord.js");

const pickN = (min, max, n, doubling) => {
	if(doubling){
		const ret = [];
		for(let i = 0; i < n; i++){
			const rand = Math.floor(Math.random() * (max - min + 1)) + min
			ret.push(rand);
		}
		return ret;
	}
	else{
		const list = new Array(max-min+1).fill().map((_, i) => i + min);
		const ret = [];
		while(n--) {
			const rand = Math.floor(Math.random() * (list.length + 1)) - 1;
			ret.push(...
				list.splice(rand, 1));
		}
		return ret;
	}
}

module.exports = {
	data: {
		name: "arcaea_odai_help",
		description: "Arcaeaの譜面からランダムで課題曲を生成します",
		options: [
			{
				type: "STRING",
				name: "pack",
				description: "楽曲のパック",
			},
			{
				type: "STRING",
				name: "level",
				description: "譜面レベル",
			},
			{
				type: "STRING",
				name: "const",
				description: "譜面定数",
			},
			{
				type: "STRING",
				name: "difficulty",
				description: "譜面難易度",
			},
			{
				type: "INTEGER",
				name: "repeat",
				description: "生成数(最大10)"
			},
			{
				type: "BOOLEAN",
				name: "private",
				description: "結果を自分だけに表示するか"
			},
			{
				type: "BOOLEAN",
				name: "doubling",
				description: "重複を許すか"
			},
		]
	},
	async execute(interaction, credentials) {
		let query = {};
		query.pack = interaction.options.getString('pack');
		query.level = interaction.options.getString('level');
		query.cons = interaction.options.getString('const');
		query.diff = interaction.options.getString('difficulty');
		const repeat = interaction.options.getInteger('repeat');
		const private = interaction.options.getBoolean('private') || false;
		const doubling = interaction.options.getBoolean('doubling') || false;

		const f = require('../functions/arcaea_query');
		const charts = await f.query(credentials, query);

		if (charts.length !== 0) {
			if(repeat){
				let ret = '\n';
				const nums = pickN(0, charts.length - 1, Math.min(repeat, 10), doubling);
				
				nums.forEach(num => {
					const chart = charts[num];
					console.log(chart, num)
					ret += `${chart.title} [${chart.diff[0]} ${chart.level}(${chart.const.toFixed(1)})]\n`;
				})
				await interaction.reply({
					content: ret,
					ephemeral: private
				});
			}
			else{
				const num = Math.floor(Math.random() * charts.length);
				const chart = charts[num];
				const embed = new Discord.MessageEmbed()
					.setTitle(`${chart.title} [${chart.diff[0]} ${chart.level}(${chart.const.toFixed(1)})]`)
					.setDescription(`アーティスト: ${chart.artist}\nパック: ${chart.pack[0]}`);
				await interaction.reply({
					embeds: [embed],
					ephemeral: private
				});
			}
		}
		else {
			await interaction.reply({
				content: 'エラー: 条件に合致する譜面が見つかりませんでした。',
				ephemeral: true 
			});
		}
	},
};