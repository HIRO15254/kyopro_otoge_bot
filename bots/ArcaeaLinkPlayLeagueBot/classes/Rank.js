//@ts-check

/** @type {Array<string>} ランクを表す文字列の列挙 */
const RANKS = ['B-', 'B', 'B+', 'A-', 'A', 'A+', 'S-', 'S', 'S+'];

/** @type {Array<number>} 初期ランクの下限レーティング値 */
const RANK_POTENTIALS = [0.00, 11.00, 11.35, 11.65, 12.00, 12.15, 12.35, 12.60, 12.80];

const Discord = require("discord.js");
const client = require("./../systems/discord.js").client;
const DISCORD_GUILD_ID = '917238912672485406'


/** @type {number} 昇格に必要なレート値 */
const PROMOTE_RATE = 50;
/** @type {number} 降格するレート値 */
const DEMOTE_RATE = 0;
/** @type {number} 昇格直後のレート値 */
const RATE_AFTER_PROMOTE = 10;
/** @type {number} 降格直後のレート値 */
const RATE_AFTER_DEMOTE = 40;


/** リーグランクを管理するクラス */
module.exports = class Rank {
  /** @type {number} リーグランクを表す数値 */
  #rank;
  /** @type {number} ランク内での位置を表す数字 */
  #rate;

  /**
   * Rankクラスのインスタンスを生成する
   * @param {string | number} rank リーグランクを表す文字列
   * @param {number} rate ランク内での位置を表す数字
   */
  constructor(rank, rate=0) {
    if (typeof rank == 'string') {
      this.#rank = RANKS.indexOf(rank);
    }
    else {
      this.#rank = rank;
    }
    this.#rate = rate;
  }

  //getterとsetter
  get rank() { return RANKS[this.#rank]; }
  set rank(rank) { this.#rank = RANKS.indexOf[rank]; }
  get rankint () { return this.#rank; }
  set rankint(rank) { this.#rank = rank; }
  get rate() { return this.#rate; }
  set rate(rate) { this.#rate = rate; }

  /**
   * rankとrateを合わせて数値として返します
   * @returns {number} 整数で表したrank+rate
   */
  valueOf() {
    return this.#rank * PROMOTE_RATE + this.#rate;
  }

  /**
   * レートを変動させます
   * @param {number} rate_diff 変動するレート値
   * @returns {string} 変動した結果何が起きたか
   */
  changeRate(rate_diff) {
    this.#rate += rate_diff;
    this.#rate = Math.max(this.#rate, DEMOTE_RATE);
    this.#rate = Math.min(this.#rate, PROMOTE_RATE);
    if (this.#rate == PROMOTE_RATE) {
      if (this.#rank != RANKS.length - 1) {
        this.#rank += 1;
        this.#rate = RATE_AFTER_PROMOTE;
        return 'promote';
      }
      else {
        return 'none';
      }
    }
    if (this.#rate == DEMOTE_RATE) {
      if (this.#rank != 0) {
        this.#rank -= 1;
        this.#rate = RATE_AFTER_DEMOTE;
        return 'demote';
      }
      else {
        return 'none';
      }
    }
    return 'none';
  }

  /**
   * このリーグランクのロールを取得する
   * @returns {Discord.Role} このリーグランクのロール
   */
  getrole() {
    return client.guilds.cache.get(DISCORD_GUILD_ID).roles.cache.find(role => role.name == this.rank);
  }

  /**
   * リーグランクを表すロールの一覧を取得する
   * @returns {Array<Discord.Role>} リーグランクを表すロールの一覧
   */
  static getroles() {
    const roles = client.guilds.cache.get(DISCORD_GUILD_ID).roles.cache;
    const ret = [];
    RANKS.forEach(rank => ret.push(roles.find(role => role.name == rank)));
    return ret;
  }

  /**
   * ポテンシャルから初期ランクを返します
   * @param {number} potential ポテンシャル値
   * @returns {Rank} 初期ランクを表すRankインスタンス
   */
  static GetInitialRank(potential) {
    let rank = -1;
    RANK_POTENTIALS.forEach(rank_potential => {
      if (potential >= rank_potential) rank++;
    })
    return new Rank(rank, (DEMOTE_RATE + PROMOTE_RATE) / 2);
  }
}
