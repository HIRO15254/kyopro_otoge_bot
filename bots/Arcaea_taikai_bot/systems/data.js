//@ts-check
const { GoogleSpreadsheetWorksheet, GoogleSpreadsheetRow } = require('google-spreadsheet');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const Player = require('../classes/Player');

/** @type {{[id: string]: Player}} */
const players = {};

/**
 * スプレッドシートから情報一式を取り出します
 * @param {GoogleSpreadsheet} spreadsheet 情報を取り出す元のGoogleSpreadSheetオブジェクト
 * @returns {Promise<{players: {[id: string]: Player}}>}
 */
exports.road = async function (spreadsheet) {
  // プレイヤー情報の読み込み
  /** @type {GoogleSpreadsheetWorksheet} */
  const playersheet = spreadsheet.sheetsByTitle['player'];
  /** @type {Array<GoogleSpreadsheetRow>} */
  const player_rows = await playersheet.getRows();
  player_rows.forEach(player_row => {
    players[player_row.id] = new Player(player_row);
  })

  return {
    'players': players,
  }
}

exports.data = {
  'players': players,
}