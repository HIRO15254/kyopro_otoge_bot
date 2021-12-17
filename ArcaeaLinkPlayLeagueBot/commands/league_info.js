const Discord = require("discord.js");
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = {
	data: {
		name: "info",
		description: "your info of reague",
	},
	async execute(interaction, data, client) {
		const replies = {
			'notentried': {
        'japanese': '`/entry`コマンドを使用して先にエントリーを行ってください',
        'english': 'You have to use `/entry` command before using this command.'
      },
		}
		if(!data.players.some(player => player.id == interaction.user.id))
		{
			await interaction.editReply({
        content: replies.notentried.japanese + '\n' + replies.notentried.english,
      });
		}
		else{
      const player = await data.players.find(user => user.id == interaction.user.id);
      let description = '';
      if (player.language == 'japanese') {
        description = `あなたはランク${player.rank}で、昇格まで${100 - parseInt(player.rate) * 2}%です`
      }
      else{
        description = `You are in reague rank ${player.rank}, ${100 - parseInt(player.rate) * 2}% to promote.`
      }
			const embed = await new Discord.MessageEmbed()
        .setImage(`https://raw.githubusercontent.com/HIRO15254/kyopro_otoge_bot/master/images/gauge${parseInt(player.rate)}.png`)
        .setTitle('Info')
        .setDescription(description);

			await interaction.editReply({
        embeds: [embed],
        ephemeral: false
      });
		}
	},
};