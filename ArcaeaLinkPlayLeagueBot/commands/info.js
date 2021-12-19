//@ts-check

const Discord = require("discord.js");
const data = require("../systems/data.js").data;

/** @type {{[id: string]: {'japanese': string, 'english': string} }} */
const replies = {
  'notentried': {
    'japanese': '`/entry`コマンドを使用して先にエントリーを行ってください',
    'english': 'You have to use `/entry` command before using this command.'
  },
}

module.exports = {
	data: {
		name: "info",
		description: "your info of reague",
    options: [
			{
				type: "BOOLEAN",
				name: "public",
				description: "set true when you show your info to public",
			},
		]
	},
  /** @param {Discord.CommandInteraction} interaction */
	async execute(interaction) {
    const public = interaction.options.getBoolean('public') || false;
    await interaction.deferReply({
      ephemeral: !public
    });
		if(!Object.keys(data.players).some(id => id == interaction.user.id))
		{
			await interaction.editReply({
        content: replies.notentried.japanese + '\n' + replies.notentried.english,
      });
		}
		else{
      const player = data.players[interaction.user.id];
      let description = '';
      if (player.language == 'japanese') {
        description = `あなたはランク${player.rank.rank}で、昇格まで${100 - player.rank.rate * 2}%です`
      }
      else{
        description = `You are in reague rank ${player.rank.rank}, ${100 - player.rank.rate * 2}% to promote.`
      }
			const embed = await new Discord.MessageEmbed()
        .setImage(`https://raw.githubusercontent.com/HIRO15254/kyopro_otoge_bot/master/images/gauge${player.rank.rate}.png`)
        .setTitle('Info')
        .setDescription(description);

			await interaction.editReply({
        embeds: [embed],
      });
		}
	},
};