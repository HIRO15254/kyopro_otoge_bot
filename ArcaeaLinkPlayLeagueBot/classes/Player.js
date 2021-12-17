//@ts-check
const { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } = require("google-spreadsheet");
import { Rank } from "./Rank.js";

/** プレイヤー情報を格納するクラス */
export class Player {
  /** @type {string} */
  #id;
  /** @type {string} */
  #name;
  /** @type {string} */
  #language;
  /** @type {Rank} */
  #rank;
  /** @type {GoogleSpreadsheetRow} */
  #spreadsheetrow;
  /**
   * プレイヤークラスのインスタンスを生成する
   * @param {GoogleSpreadsheetRow} spreadsheetrow 対応するGoogleSpreadSheetRowオブジェクト
   * @memberof Player
   */
  constructor(spreadsheetrow) {
    this.#id = spreadsheetrow.id;
    this.#name = spreadsheetrow.name;
    this.#language = spreadsheetrow.language;
    this.#rank = new Rank(spreadsheetrow.rank, parseInt(spreadsheetrow.rate));
    this.#spreadsheetrow = spreadsheetrow;
  }
  // GetterとSetter
  get id() { return this.#id; }
  set id(id) { this.#id = id; }
  get name() { return this.#name; }
  set name(name) { this.#name = name; }
  get language() { return this.#language; }
  set language(language) { this.#language = language; }
  get rank() { return this.#rank }
  set rank(rank) { this.#rank = rank; }
  get spreadsheetrow() { return this.#spreadsheetrow; }
  async save() {
    this.#spreadsheetrow.id = this.#id;
    this.#spreadsheetrow.name = this.#name;
    this.#spreadsheetrow.language = this.#language;
    this.#spreadsheetrow.rank = this.#rank.rank;
    this.#spreadsheetrow.rate = this.#rank.rate;
    await this.#spreadsheetrow.save()
  }
  async delete() {
    await this.#spreadsheetrow.delete();
  }

  /**
   * 新しいSpreadSheetの行を作ってPlayerクラスのインスタンスにして返します
   * @param {GoogleSpreadsheetWorksheet} sheet Playerを管理しているGoogleSpreadSheetのWorkSheet
   * @param {string} id DiscordのID
   * @param {string} name 名前
   * @param {string} language bot言語
   * @param {Rank} rank リーグランク
   * @returns {Promise<Player>} 作成されたPlayerクラスのインスタンス
   */
  static async create(sheet, id, name, language, rank) {
    const spreadsheetrow = await sheet.addRow({
      'id': id,
      'name': name,
      'language': language,
      'rank': rank.rank,
      'rate': rank.rate,
    });
    return new Player(spreadsheetrow);
  }
}
