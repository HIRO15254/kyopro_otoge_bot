const Discord = require("discord.js");

module.exports = {
	data: {
		name: "matching",
		description: "start waiting for match",
	},
	async execute(interaction, data, client) {
    const match = await require('../functions/league_matching.js');
    try {
      const rep = await match.matching(interaction, data, client)
      await interaction.editReply({
        content: rep,
      });
    }
    catch (error) {
      throw error;
    }
	},
};