const Discord = require("discord.js");

module.exports = {
	data: {
		name: "cancel",
		description: "cancel waiting for match",
	},
	async execute(interaction, data, client) {
    const match = await require('../functions/league_matching.js');
    try {
      const rep = await match.cancel(interaction, data, client)
      await interaction.editReply({
        content: rep,
      });
    }
    catch (error) {
      throw error;
    }
	},
};