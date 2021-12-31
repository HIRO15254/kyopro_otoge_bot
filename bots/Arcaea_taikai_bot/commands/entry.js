//@ts-check
const Discord = require("discord.js");

const data = require("./../systems/data.js").data;
const Player = require("./../classes/Player.js");

/** @type {{[id: string]: string} }} */
const replies = {
  'alreadyentried': '既にエントリーしています',
  'accept': '受け付けました!',
}

module.exports = {
  data: {
    name: "entry",
    description: "大会へのエントリーを行います",
    options: [
      {
        type: "NUMBER",
        name: "potential",
        required: true,
        description: "現在のポテンシャル値",
      },
    ]
  },
  /** @param {Discord.CommandInteraction} interaction */
  async execute(interaction) {
    await interaction.deferReply({
      ephemeral: false,
    });

    const potential = interaction.options.getNumber('potential');

    if (Object.keys(data.players).some(id => id == interaction.user.id)) {
      await interaction.editReply({
        content: replies.alreadyentried,
      });
    }
    else {
      data.players[interaction.user.id] = await Player.create(interaction.user.id, interaction.user.username, potential);
      data.players[interaction.user.id].reset_role();
      await interaction.editReply({
        content: replies.accept,
      });
    }
  },
};