//@ts-check

const Discord = require("discord.js");
const { GoogleSpreadsheet } = require("google-spreadsheet");

exports.awake = async function() {
  /** @type {GoogleSpreadsheet} */
  const SPREADSHEET = await require('./systems/spreadsheet.js').road();
  await require('./systems/data.js').road(SPREADSHEET);
  await require('./systems/discord.js').road();
}
