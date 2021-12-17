//@ts-check

/** @type {Object.<string, number>} */
const RANKS = {
  'B-': 0,
  'B': 1,
  'B+': 2,
  'A-': 3,
  'A': 4,
  'A+': 5,
  'S-': 6,
  'S': 7,
  'S+': 8
}

/** @type {number} 昇格に必要なレート値 */
const PROMOTE_RATE = 50;
/** @type {number} 降格するレート値 */
const DEMOTE_RATE = 0;


/** リーグランクを管理するクラス */
export class Rank {
  /** @type {string} リーグランクを表す文字列 */
  #rank;
  /** @type {number} ランク内での位置を表す数字 */
  #rate;

  /**
   * Rankクラスのインスタンスを生成する
   * @param {string} rank リーグランクを表す文字列
   * @param {number} rate ランク内での位置を表す数字
   */
  constructor(rank, rate=0) {
    if (rank in RANKS) { 
      this.#rank = rank; 
    }
    else { 
      throw 'Rankクラスを存在しないrankで宣言しようとしました';
    }
    this.#rate = rate;
  }

  //getterとsetter
  get rank() { return this.#rank; }
  set rank(rank) { 
    if (rank in RANKS) { 
      this.#rank = rank;
    }
    else {
      throw 'Rankオブジェクトに存在しないrankを代入しようとしました';
    }
  }
  get rate() { return this.#rate; }
  set rate(rate) { this.#rate = rate; }

  /**
   * rankを整数にして返します
   * @returns 整数で表したrank
   */
  rankint () {
    return RANKS[this.#rank];
  }

  /**
   * rankとrateを合わせて数値として返します
   * @returns 整数で表したrank+rate
   */
  rankrateint () {
    return RANKS[this.#rank] * PROMOTE_RATE + this.#rate;
  }
}