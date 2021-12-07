const { GoogleSpreadsheet } = require('google-spreadsheet');
const Discord = require("discord.js");

function constToLevel(cons) {
	const cons_int = parseInt(cons)
	if(cons < 9){
		return toString(cons_int);
	}
	else{
		if(cons - cons_int < 0.7){
			return toString(cons_int);
		}
		else{
			return toString(cons_int) + "+";
		}
	}
}

function stringToLevel(str) {
	if (str[str.length - 1] == '+'){
		return parseInt(str.substring(0, str.length - 1)) * 2 - 8
	}
	else{
		if(parseInt(str) < 9){
			return parseInt(str)
		}
		else{
			return parseInt(str) * 2 - 9
		}
	}
}

module.exports = {
	data: {
		name: "arcaea_odai",
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
		]
	},
	async execute(interaction, credentials) {
		const doc = new GoogleSpreadsheet('11PDRjN6gcPexgxuYui5B_Xd0BRQQ8tImKh31SVHnmWo');
		await doc.useServiceAccountAuth(credentials);
		await doc.loadInfo();

		const Sheet = await doc.sheetsById[624650468];
		const Rows = await Sheet.getRows();

		const pack = interaction.options.getString('pack');
		const level = interaction.options.getString('level');
		const cons = interaction.options.getString('const');
		const diff = interaction.options.getString('difficulty');
		const repeat = interaction.options.getInteger('repeat');

		let charts = [];
		Rows.forEach(e => {
			let pack_short = ''
			e.pack.split(' ').forEach(function(e) {
				pack_short += e[0];
			});
			charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Past', 'PST'], 'const': parseFloat(e.past), 'level': constToLevel(parseFloat(e.past))});
			charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Present', 'PRS'], 'const': parseFloat(e.present), 'level': constToLevel(parseFloat(e.present)) });
			charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Future', 'FTR'], 'const': parseFloat(e.future), 'level': constToLevel(parseFloat(e.future)) });
			if (e.title === 'dropdead') { charts[charts.length - 1].level = 8; }
			if (e.beyond != undefined) {
				charts.push({ 'title': e.title, 'artist': e.artist, 'pack': [e.pack, pack_short], 'diff': ['Beyond', 'BYD'], 'const': parseFloat(e.beyond), 'level': constToLevel(parseFloat(e.beyond)) });
			}
		});

		if (pack != null) {
			const packs = pack.split(',');
			const filtered_charts = charts.filter(function(element) {
				let ans = false
				packs.forEach(function(pack) {
					if (element.pack[0].toLowerCase() === pack.toLowerCase() || element.pack[1].toLowerCase() === pack.toLowerCase()) {
						ans = true;
					}
				});
				return ans
			});
			charts = filtered_charts;
		}

		if (diff != null) {
			const diffs = diff.split(',');
			const filtered_charts = charts.filter(function(element) {
				let ans = false
				diffs.forEach(function(diff) {
					if (element.diff[0].toLowerCase() === diff.toLowerCase() || element.diff[1].toLowerCase() === diff.toLowerCase()) {
						ans = true;
					}
				});
				return ans;
			});
			charts = filtered_charts;
		}

		if (cons != null) {
			let re = /{(.+?):(.+?)}/;
			if (re.exec(cons)){
				q = re.exec(cons);
				const filtered_charts = charts.filter(function(element) {
					return parseFloat(q[1]) <= element.const && parseFloat(q[2]) >= element.const;
				});
				charts = filtered_charts;
			}
			else{
				const filtered_charts = charts.filter(function(element) {
					return parseFloat(cons) === element.const;
				});
				charts = filtered_charts;
			}
		}

		if (level != null) {
			let re = /{(.+?):(.+?)}/;
			if (re.exec(level)){
				q = re.exec(level);
				const filtered_charts = charts.filter(function(element) {
					return stringToLevel(q[1]) <= stringToLevel(element.level) && stringToLevel(q[2]) >= stringToLevel(element.level);
				});
				charts = filtered_charts;
			}
			else{
				const filtered_charts = charts.filter(function(element) {
					return level === element.level;
				});
				charts = filtered_charts;
			}
		}

		if (charts.length !== 0) {
			if(repeat){
				let ret = ''
				for(let i = 0; i < Math.min(repeat, 10) && charts.length != 0; i++){
					const num = Math.floor(Math.random() * charts.length);
					const chart = charts[num];
					ret += `${chart.title} [${chart.diff[0]} ${chart.level}(${chart.const.toFixed(1)})]\n`
					charts.splice(num);
				}
				await interaction.reply({
					content: ret
				});
			}
			else{
				const num = Math.floor(Math.random() * charts.length);
				const chart = charts[num];
				const embed = new Discord.MessageEmbed()
					.setTitle(`${chart.title} [${chart.diff[0]} ${chart.level}(${chart.const.toFixed(1)})]`)
					.setDescription(`アーティスト: ${chart.artist}\nパック: ${chart.pack[0]}`);
				await interaction.reply({ embeds: [embed] });
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