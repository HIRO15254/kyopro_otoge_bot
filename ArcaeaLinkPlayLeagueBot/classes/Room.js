//@ts-check
const { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } = require("google-spreadsheet");
const { Player } = require("./Player");
const { Rank } = require("./Rank");

/** @type {Object.<string, number>} Roomの状態を表すObject */
const ROOM_STATES = {
  MATCHING: 0,
  PLAYING: 1,
  FINISHED: 2,
}

/** マッチングが行われるルーム */
class Room {
  /** @type {number} 部屋番号 */
  #number;
  /** @type {string} 部屋の状態 */
  #state;
  /** @type {{min: Rank, max: Rank}} */
  #rank;
  /** @type {Array<{player: Player, point: number}>} */
  #players;
  /** @type {GoogleSpreadsheetRow} */
  #spreadsheetrow;

  /**
   * Roomクラスのインスタンスを生成する
   * @param {GoogleSpreadsheetRow} spreadsheetrow 対応するGoogleSpreadSheetRowオブジェクト
   * @param {Array<Player>} players 全プレイヤーのPlayerオブジェクトが格納されたArray
   */
  constructor(spreadsheetrow, players) {
    this.#number = parseInt(spreadsheetrow.number);
    this.#state = spreadsheetrow.state;
    this.#rank = {
      min: spreadsheetrow.rank_min,
      max: spreadsheetrow.rank_max,
    }
    this.#players = [
      {player: players.find(player => player.id == spreadsheetrow.id0), point: -1},
      {player: players.find(player => player.id == spreadsheetrow.id1), point: -1},
      {player: players.find(player => player.id == spreadsheetrow.id2), point: -1},
      {player: players.find(player => player.id == spreadsheetrow.id3), point: -1}
    ]
    this.#spreadsheetrow = spreadsheetrow;
  }

  // GetterとSetter
  get number() { return this.#number; }
  set number(number) { this.#number = number; }
  get state() { return this.#state; }
  set state(state) { this.#state = state; }
  get rank() { return this.#rank; }
  set rank(rank) { this.#rank = rank; }
  get players() { return this.#players; }
  set players(players) { this.#players = players; }
  get spreadsheetrow() {return this.#spreadsheetrow; }

  /**
   * 新しいSpreadSheetの行を作ってRoomクラスのインスタンスにして返します
   * @param {GoogleSpreadsheetWorksheet} sheet Roomを管理しているGoogleSpreadSheet
   * @param {number} number 部屋の番号
   * @param {Player} player 部屋を立てたプレイヤー
   */
  static async create(sheet, number, player){
    const spreadsheetrow = await sheet.addRow({
      'number': number,
      'state': ROOM_STATES.MATCHING,
      'rank_min': player.rank.rank,
      'rank_max': player.rank.rank,
      'id0': player.id,
    });
    return;
  }
}