const { GoogleSpreadsheet } = require('google-spreadsheet');
const Discord = require("discord.js");
module.exports = {
	data: {
		name: "arcaea_odai_help",
		description: "arcaea関係のコマンドのヘルプです。",
	},
	async execute(interaction, credentials) {
    const embed = new Discord.MessageEmbed()
      .setTitle('arcaea_help')
      .setDescription('arcaea関連のコマンドのヘルプです。')
      .addField('pack', 'パック名(完全)または、各単語の頭文字を繋げた略称で絞り込みます。コンマ区切りでの複数指定が可能です。')
      .addField('level', '譜面レベルで絞り込みます。`{a:b}`形式でa以上b以下を指定できます。')
      .addField('const', '譜面定数で絞り込みます。`{a:b}`形式でa以上b以下を指定できます。')
      .addField('difficulty', '譜面難易度で絞り込みます。PST,PRS,FTR,BYDの略称と、コンマ区切りでの複数指定が可能です。')
      .addField('repeat', '繰り返し生成する個数を指定します。10以上を指定しても10譜面までしか返されません。')
		await interaction.reply({
      embeds: [embed],
      ephemeral: true 
    });
	},
};