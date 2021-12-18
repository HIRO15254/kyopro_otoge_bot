//@ts-check
const { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } = require("google-spreadsheet");

/** ALPLの開催スケジュールを管理するクラス */
module.exports = class Schedule {
  /** @type {string} */
  #name;
  /** @type {Date} */
  #start;
  /** @type {Date} */
  #end;
  /** @type {GoogleSpreadsheetRow} */
  #spreadsheetrow
  /**
   * Scheduleクラスのインスタンスを作成する
   * @param {GoogleSpreadsheetRow} spreadsheetrow 対応するGoogleSpreadSheetRowオブジェクト
   */
  constructor(spreadsheetrow) {
    this.#name = spreadsheetrow.name;
    this.#start = new Date(spreadsheetrow.start);
    this.#end = new Date(spreadsheetrow.end);
    this.#spreadsheetrow = spreadsheetrow;
  }

  get name() { return this.#name; }
  set name(name) { this.#name = name; }
  get start() { return this.#start; }
  set start(start) { this.#start = start; }
  get end() { return this.#end; }
  set end(end) { this.#end = end; }
  get spreadsheetrow() { return this.#spreadsheetrow; }

  /**
   * 現在開催されているかを返します
   * @param {Date} now 現在時刻を表すdateクラス
   * @returns {boolean} 開催中か否か
   */
  holding(now) {
    return (this.#start.valueOf() <= now.valueOf() && now.valueOf() <= this.#end.valueOf());
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