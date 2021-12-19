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

    const guild = client.guilds.cache.get(DISCORD_GUILD_ID);
    /** @type {Discord.TextChannel} */
    const channel = await guild.channels.create(`test`, { parent: '919059123738402837', permissionOverwrites: [{id: guild.roles.everyone, deny: ['VIEW_CHANNEL']},]});
    const ids = Object.keys(data.players);
    for (let i in ids) {
      await channel.permissionOverwrites.create( await client.users.fetch(ids[i]), { VIEW_CHANNEL:true } )
    }
    await interaction.editReply("done.");
	},
};