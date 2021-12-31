//@ts-check
const { GoogleSpreadsheetRow } = require("google-spreadsheet");
const Discord = require("discord.js");

const SPREADSHEET = require('../systems/spreadsheet.js').spreadsheet;

const client = require("../systems/discord.js").client;
const DISCORD_GUILD_ID = '918371121131311145'

/** プレイヤー情報を格納するクラス */
module.exports = class Player {
  /** @type {string} */
  id;
  /** @type {string} */
  name;
  /** @type {number} */
  potential;
  /** @type {number} */
  league;
  /** @type {GoogleSpreadsheetRow} */
  spreadsheetrow;
  /**
   * プレイヤークラスのインスタンスを生成する
   * @param {GoogleSpreadsheetRow} spreadsheetrow 対応するGoogleSpreadSheetRowオブジェクト
   * @memberof Player
   */
  constructor(spreadsheetrow) {
    this.id = spreadsheetrow.id;
    this.name = spreadsheetrow.name;
    this.potential = spreadsheetrow.potential;
    this.league = spreadsheetrow.league;
    this.spreadsheetrow = spreadsheetrow;
  }

  async save() {
    this.spreadsheetrow.id = this.id;
    this.spreadsheetrow.name = this.name;
    this.spreadsheetrow.potential = this.potential;
    this.spreadsheetrow.league = this.league;
    await this.spreadsheetrow.save()
  }

  async delete() {
    const guildmember = await (await client.guilds.fetch(DISCORD_GUILD_ID)).members.fetch(this.id);
    const role = client.guilds.cache.get(DISCORD_GUILD_ID).roles.cache.find(role => role.name == '第２回大会参加者');
    await guildmember.roles.remove(role);
    await this.spreadsheetrow.delete();
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

  }

  /**
   * プレイヤーのロールを現在のランクにセット
   */
  async reset_role() {
    const guildmember = await (await client.guilds.fetch(DISCORD_GUILD_ID)).members.fetch(this.id);
    const role = client.guilds.cache.get(DISCORD_GUILD_ID).roles.cache.find(role => role.name == '第２回大会参加者');
    await guildmember.roles.add(role);
  }

  /**
   * 新しいSpreadSheetの行を作ってPlayerクラスのインスタンスにして返します
   * @param {string} id DiscordのID
   * @param {string} name 名前
   * @param {number} potential ポテンシャル
   * @returns {Promise<Player>} 作成されたPlayerクラスのインスタンス
   */
  static async create(id, name, potential) {
    const spreadsheetrow = await SPREADSHEET.sheetsByTitle['player'].addRow({
      'id': id,
      'name': name,
      'potential': potential,
    });
    return new Player(spreadsheetrow);
  }
}