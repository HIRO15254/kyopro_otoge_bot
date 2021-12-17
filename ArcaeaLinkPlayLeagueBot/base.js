//@ts-check

const Discord = require("discord.js");
const { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet, ServiceAccountCredentials } = require("google-spreadsheet");

exports.awake = async function() {
  /** @type {Discord.Client} */
  const DISCORD_CLIENT = await require('./systems/discord.js');
  /** @type {GoogleSpreadsheet} */
  const SPREADSHEET = await require('./systems/spreadsheet.js');
  /** @type {GoogleSpreadsheetWorksheet} */
  const SPREADSHEET_SCHEDULE = SPREADSHEET.sheetsByTitle['schedule'];
  /** @type {GoogleSpreadsheetWorksheet} */
  const SPREADSHEET_PLAYER = SPREADSHEET.sheetsByTitle['player'];
  /** @type {GoogleSpreadsheetWorksheet} */
  const SPREADSHEET_ROOM = SPREADSHEET.sheetsByTitle['room'];
}
