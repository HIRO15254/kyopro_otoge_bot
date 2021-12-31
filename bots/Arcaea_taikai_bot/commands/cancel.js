//@ts-check
const Discord = require("discord.js");

const data = require("./../systems/data.js").data;

/** @type {{[id: string]: string} }} */
const replies = {
  'notentried': 'エントリーしていません',
  'accept': '受け付けました!',
}

module.exports = {
  data: {
    name: "entry",
    description: "大会へのエントリーをキャンセルする",
  },
  /** @param {Discord.CommandInteraction} interaction */
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: false,
    });

    if (Object.keys(data.players).some(id => id == interaction.user.id)) {
      await interaction.editReply({
        content: replies.accept,
      });
      await data.players[interaction.user.id].delete();
      delete data.players[interaction.user.id];
    }
    else {
      await interaction.editReply({
        content: replies.notentried,
      });
    }
  },
};