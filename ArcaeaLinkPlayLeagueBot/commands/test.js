//@ts-check
const Discord = require("discord.js");

const data = require("../systems/data.js").data;

const client = require("./../systems/discord.js").client;
const DISCORD_GUILD_ID = '917238912672485406'

module.exports = {
	data: {
		name: "test",
		description: "test",
	},
  /** @param {Discord.CommandInteraction} interaction */
	async execute(interaction) {
    await interaction.deferReply({
      ephemeral: true
    });

    const ids = Object.keys(data.players);
    for (let i in ids) {
      try { await data.players[ids[i]].reset_role(); }
      catch { console.log(ids[i]); }
    }
    await interaction.editReply("done.");
	},
};