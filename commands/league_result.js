const Discord = require("discord.js");

module.exports = {
	data: {
		name: "result",
		description: "report your result",
    options: [
			{
				type: "INTEGER",
				name: "point",
        required: true,
				description: "your points of this match",
			},
      {
				type: "USER",
				name: "member",
				description: "if you want to report other members points, set this",
			},
		]
	},
	async execute(interaction, data, client) {
    const system = await require('../functions/league_system.js');
    try {
      const rep = await system.result(interaction, data, client)
      await interaction.editReply({
        content: rep,
        ephemeral: false
      });
    }
    catch (error) {
      throw error;
    }
	},
};