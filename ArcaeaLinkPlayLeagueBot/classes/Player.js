//@ts-check
const { GoogleSpreadsheetRow } = require("google-spreadsheet");
const Discord = require("discord.js");

const Rank = require("./Rank.js");

const SPREADSHEET = require('./../systems/spreadsheet.js').spreadsheet;

const client = require("./../systems/discord.js").client;

/** プレイヤー情報を格納するクラス */
module.exports = class Player {
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
   * このユーザーにDMを送信します
   * @param {string | Discord.MessagePayload | Discord.MessageOptions} content メッセージの内容
   */
  async sendDM(content) {
    const user = await client.users.fetch(this.id);
    await user.send(content);
  }

  /**
   * レートの変動を記録しDMを送信します
   * @param {number} rank 順位
   * @param {number} rate 変動レーティング
   */
  async result(rank, rate) {
    const place_name = ["1st", "2nd", "3rd", "4th"];
    const result = this.#rank.changeRate(rate);
    let description = '';

    if (result == 'promote') {
      if (this.#language == 'japanese') {
        description = `あなたは${rank}位になり、ランク${this.#rank.rank}に昇格しました!`
      }
      else{
        description = `You got ${place_name[rank]} place, and you promoted to league rank ${this.#rank.rank}!`
      }
    }
    else if (result == 'demote') {
      if (this.#language == 'japanese') {
        description = `あなたは${rank}位になり、ランク${this.#rank.rank}に降格しました...`
      }
      else{
        description = `You got ${place_name[rank]} place, and you deomoted to league rank ${this.#rank.rank}...`
      }
    }
    else {
      if (this.#language == 'japanese') {
        description = `あなたは${rank}位になり、昇格まで${100 - this.#rank.rate * 2}%です`
      }
      else{
        description = `You got ${place_name[rank]} place, ${100 - this.#rank.rate * 2}% to promote.`
      }
    }
    await this.save();
    const embed = new Discord.MessageEmbed()
      .setImage(`https://raw.githubusercontent.com/HIRO15254/kyopro_otoge_bot/master/images/gauge${this.#rank.rate}.png`)
      .setTitle('Result')
      .setDescription(description);
    await this.sendDM({
      embeds: [embed]
    });

  }

  /**
   * 新しいSpreadSheetの行を作ってPlayerクラスのインスタンスにして返します
   * @param {string} id DiscordのID
   * @param {string} name 名前
   * @param {string} language bot言語
   * @param {Rank} rank リーグランク
   * @returns {Promise<Player>} 作成されたPlayerクラスのインスタンス
   */
  static async create(id, name, language, rank) {
    const spreadsheetrow = await SPREADSHEET.sheetsByTitle['player'].addRow({
      'id': id,
      'name': name,
      'language': language,
      'rank': rank.rank,
      'rate': rank.rate,
    });
    return new Player(spreadsheetrow);
  }
}