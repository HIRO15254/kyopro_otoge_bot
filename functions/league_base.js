//@ts-check

const Discord = require("discord.js");
const { GoogleSpreadsheetWorksheet } = require("google-spreadsheet");
const { GoogleSpreadsheet, GoogleSpreadsheetRow } = require('google-spreadsheet');

/** 昇格するレート */
const PROMOTE_RATE = 50;
/** 降格するレート */
const DEMOTE_RATE = 0;

/** プレイヤー情報を格納するクラス */
class Player {
  /**
   * プレイヤークラスのインスタンスを生成する
   * @param {GoogleSpreadsheetRow} spreadsheetrow 対応するGoogleSpreadSheetRowオブジェクト
   * @memberof Player
   */
  constructor(spreadsheetrow) {
    /** @type {string} */
    this._name = spreadsheetrow.name;
    /** @type {string} */
    this._language = spreadsheetrow.language;
    /** @type {string} */
    this._rank = spreadsheetrow.rank;
    /** @type {number} */
    this._rate = parseInt(spreadsheetrow.rate);
    /** @type {GoogleSpreadsheetRow} */
    this._spreadsheet = spreadsheetrow;
  }
  // GetterとSetter
  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }
  get language() {
    return this._language;
  }
  set language(language) {
    this._language = language;
  }
  get rank() {
    return this._rank
  }
  set rank(rank) {
    this._rank = rank;
  }
  get rate() {
    return this._rate;
  }
  set rate(rate) {
    this.rate = Math.max(DEMOTE_RATE, Math.min(rate, PROMOTE_RATE));
  }
  async save() {
    this._spreadsheet.name = this._name;
    this._spreadsheet.language = this._language;
    this._spreadsheet.rank = this._rank;
    this._spreadsheet.rate = this._rate;
    await this._spreadsheet.save()
  }
  async delete() {
    await this._spreadsheet.delete();
  }

  /**
   * 新しいSpreadSheetの行を作ってPlayerクラスのインスタンスにして返します
   * @param {GoogleSpreadsheetWorksheet} sheet Playerを管理しているGoogleSpreadSheetのWorkSheet
   * @param {string} name 名前
   * @param {string} language bot言語
   * @param {string} rank リーグランク
   * @param {number} rate レート
   * @returns {Promise<Player>} 作成されたPlayerクラスのインスタンス
   */
  static async create(sheet, name, language, rank, rate) {
    const spreadsheetrow = await sheet.addRow({
      'name': name,
      'language': language,
      'rank': rank,
      'rate': rate,
    });
    return new Player(spreadsheetrow);
  }
}

/** ALPLの開催スケジュールを管理するクラス */
class Schedule {
  /**
   * Scheduleクラスのインスタンスを作成する
   * @param {GoogleSpreadsheetRow} spreadsheetrow 対応するGoogleSpreadSheetRowオブジェクト
   */
  constructor(spreadsheetrow) {
    /** @type {string} */
    this._name = spreadsheetrow.name;
    /** @type {Date} */
    this._start = new Date(spreadsheetrow.start);
    /** @type {Date} */
    this._end = new Date(spreadsheetrow.end);
  }

  get name() {
    return this._name;
  }
  set name(name) {
    this._name = name;
  }
  get start() {
    return this._start;
  }
  set start(start) {
    this._start = start;
  }
  get end() {
    return this._end;
  }
  set end(end) {
    this._end = end;
  }

  /**
   * 新しいSpreadSheetの行を作ってScheduleクラスのインスタンスにして返します
   * @param {GoogleSpreadsheetWorksheet} sheet Scheduleを管理しているGoogleSpreadSheetのworksheet
   * @param {string} name イベントの名前
   * @param {Date} start 開始時間
   * @param {Date} end 終了時間
   * @return {Promise<Schedule>} 作成したScheduleクラスのインスタンス
   */
  static async create(sheet, name, start, end) {
    const spreadsheetrow = await sheet.addRow({
      'name': name,
      'start': start.toLocaleString(),
      'end': end.toLocaleDateString(),
    });
    return new Schedule(spreadsheetrow);
  }
}

/** マッチングが行われるルーム */
class Room {
  /**
   * Roomクラスのインスタンスを生成する
   * @param {GoogleSpreadsheetRow} spreadsheetrow 対応するGoogleSpreadSheetRowオブジェクト
   */
  constructor(spreadsheetrow) {
    /** @type {number} 部屋番号 */
    this._number = parseInt(spreadsheetrow.number);
    /** @type {string} 部屋の状態 */
    this._state = spreadsheetrow.state;
    /** @type {object} 部屋参加者のランク */
    this._rank = {
      min: spreadsheetrow.rank_min,
      max: spreadsheetrow.rank_max,
    }
    /** @type {Array<Player>} 部屋参加者の一覧 */
    this._id = [
      
    ]
  }
}