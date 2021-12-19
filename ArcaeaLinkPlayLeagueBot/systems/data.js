//@ts-check
const { GoogleSpreadsheetWorksheet, GoogleSpreadsheetRow } = require('google-spreadsheet');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const Player = require('../classes/Player.js');
const Room = require('../classes/Room');
const Schedule = require('../classes/Schedule.js');

/** @type {{[id: string]: Player}} */
const players = {};
/** @type {Array<Room>} */
const rooms = [];
/** @type {Array<Schedule>}} */
const schedules = [];

/**
 * スプレッドシートから情報一式を取り出します
 * @param {GoogleSpreadsheet} spreadsheet 情報を取り出す元のGoogleSpreadSheetオブジェクト
 * @returns {Promise<{players: {[id: string]: Player}, rooms: Array<Room>, schedules: Array<Schedule>}>}
 */
exports.road = async function(spreadsheet) {
  // プレイヤー情報の読み込み
  /** @type {GoogleSpreadsheetWorksheet} */
  const playersheet = spreadsheet.sheetsByTitle['player'];
  /** @type {Array<GoogleSpreadsheetRow>} */
  const player_rows = await playersheet.getRows();
  player_rows.forEach(player_row => {
    players[player_row.id] = new Player(player_row);
  })

  // ルーム情報の読み込み
  /** @type {GoogleSpreadsheetWorksheet} */
  const roomsheet = spreadsheet.sheetsByTitle['room'];
  /** @type {Array<GoogleSpreadsheetRow>} */
  const room_rows = await roomsheet.getRows();
  room_rows.forEach(room_row => {
    rooms.push(new Room(room_row, players));
  })

  // 開催時間情報の読み込み
  /** @type {GoogleSpreadsheetWorksheet} */
  const schedulesheet = spreadsheet.sheetsByTitle['schedule'];
  /** @type {Array<GoogleSpreadsheetRow>} */
  const schedule_rows = await schedulesheet.getRows();
  schedule_rows.forEach(schedule_row => {
    schedules.push(new Schedule(schedule_row));
  })

  return {
    'players': players,
    'rooms': rooms,
    'schedules': schedules,
  }
}

exports.data = {
  'players': players,
  'rooms': rooms,
  'schedules': schedules,
}