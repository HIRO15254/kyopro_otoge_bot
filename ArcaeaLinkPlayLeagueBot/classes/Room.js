//@ts-check
const { GoogleSpreadsheetRow } = require("google-spreadsheet");
const Discord = require("discord.js");

const Player = require("./Player.js");
const Rank = require("./Rank.js");

const client = require("./../systems/discord.js").client;
const DISCORD_GUILD_ID = '917238912672485406'

const SPREADSHEET = require('./../systems/spreadsheet.js').spreadsheet;

/** @type {Array<string>} Roomの状態を表すObject */
const STATE_STRING = ['matching', 'playing', 'finished'];

/** マッチングが行われるルーム */
module.exports = class Room {
  /** @type {number} 部屋番号 */
  #number;
  /** @type {number} 部屋の状態 */
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
   * @param {{[id: string]: Player}} players 全プレイヤーのPlayerオブジェクトが格納されたArray
   */
  constructor(spreadsheetrow, players = {}) {
    if (players == {}) { players = require("../systems/data.js").data.players; }
    this.#number = parseInt(spreadsheetrow.number);
    this.#state = STATE_STRING.indexOf(spreadsheetrow.state);
    this.#rank = {
      min: new Rank(spreadsheetrow.rank_min),
      max: new Rank(spreadsheetrow.rank_max),
    }
    this.#players = [];
    for (let i = 0; i < 4; i++) {
      if (spreadsheetrow['id' + i]) {
        this.#players.push({player: players[spreadsheetrow['id' + i]], point: spreadsheetrow.point0 || -1});
      }
    }
    this.#spreadsheetrow = spreadsheetrow;
  }

  // GetterとSetter
  get number() { return this.#number; }
  set number(number) { this.#number = number; }
  get state() { return STATE_STRING[this.#state]; }
  set state(state) { this.#state = STATE_STRING.indexOf(state); }
  get stateint() { return this.#state; }
  set stateint(state) { this.#state = state; }
  get rank() { return this.#rank; }
  set rank(rank) { this.#rank = rank; }
  get players() { return this.#players; }
  set players(players) { this.#players = players; }
  get spreadsheetrow() {return this.#spreadsheetrow; }

  async save() {
    this.#spreadsheetrow.number = this.#number;
    this.#spreadsheetrow.state = STATE_STRING[this.#state];
    this.#spreadsheetrow.rank_min = this.#rank.min.rank;
    this.#spreadsheetrow.rank_max = this.#rank.max.rank;
    this.#spreadsheetrow.id0 = this.#players[0].player.id || '';
    this.#spreadsheetrow.id1 = this.#players[1].player.id || '';
    this.#spreadsheetrow.id2 = this.#players[2].player.id || '';
    this.#spreadsheetrow.id3 = this.#players[3].player.id || '';
    this.#spreadsheetrow.point0 = this.#players[0].point || '';
    this.#spreadsheetrow.point1 = this.#players[1].point || '';
    this.#spreadsheetrow.point2 = this.#players[2].point || '';
    this.#spreadsheetrow.point3 = this.#players[3].point || '';
    await this.#spreadsheetrow.save();
  }

  /**
   * この部屋に措定したプレイヤーが入室できるか調べます
   * @param {Player} player 入室できるかをチェックするプレイヤー
   * @returns {boolean} 入室できるか
   */
  can_join(player) {
    const data = require("../systems/data.js").data;
    // そもそもマッチング中であるかをチェックする
    if (this.#state != 0) {
      return false;
    }

    // ランク的に参加できるかをチェック
    if (this.#rank.max.rankint - this.#rank.min.rankint < 2) {
      if (this.#rank.min.rankint - 1 > player.rank.rankint || player.rank.rankint > this.#rank.max.rankint + 1) return false;
    }
    else {
      if (this.#rank.min.rankint > player.rank.rankint || player.rank.rankint > this.#rank.max.rankint) return false;
    }

    // 当たったことのある人が2人以上いないか、あるいは3回目に当たる人がいないか
    let counter = 0;
    this.#players.forEach(room_player => {
      data.rooms.forEach(other_room => {
        if (other_room != this && other_room.state != 'matching' && other_room.in_room(player, room_player.player)) counter++;
      })
    })
    return counter < 2;
  }

  /**
   * この部屋に指定したプレイヤー(達)がいるかを調べます
   * @param {Array<Player>} players いるかを調べるプレイヤー(複数指定可)
   */
  in_room(...players) {
    let ret = true;
    players.forEach(player => {
      ret = ret && this.#players.some(mem => mem.player == player);
    });
    return ret;
  }

  /**
   * ルームに人を追加します
   * @param {Player} player 追加される人
   */
  async add(player) {
    this.#players.push({ player: player, point: -1 });
    if (this.#rank.max.valueOf() < player.rank.valueOf()) this.#rank.max = player.rank;
    if (player.rank.valueOf() < this.#rank.min.valueOf()) this.#rank.max = player.rank;
    if (this.#players.length == 4) {
      await this.start();
    }
    await this.save();
  }

  /**
   * 部屋からプレイヤーを削除します(0人になったら部屋も削除します)
   * @param {Player} player 削除するプレイヤー
   */
  async remove(player) {
    this.#players.splice(this.#players.indexOf(this.#players.find(room_player => room_player.player == player)), 1);
    if(this.#players.length == 0){
      await this.delete();
      return true;
    }
    else{
      await this.save();
      return false;
    }
  }

  /**
   * 試合結果を書き込みます
   * @param {Player} player 
   * @param {number} point 
   */
  async add_result(player, point) {
    const result_player = this.#players.find(room_player => room_player.player == player);
    result_player.point = point;
    if (!this.#players.some(room_player => room_player.point != -1)) {
      await this.finish();
    }
    await this.save();
  }

  async finish() {
    for(let i in this.#players) {
      let rate = 12
      let rank = 1
      for (let j in this.#players) {
        if (i != j) {
          if(this.#players[i].point < this.#players[j].point) {
            rank += 1
            rate -= 6
          }
          else if(this.#players[i].point == this.#players[j].point) {
            rate -= 3
          }
          rate += this.#players[j].player.rank.rankint - this.#players[i].player.rank.rankint
        }
      }
      this.#players[i].player.result(rank, rate);
    }
    this.#state = 2;
  }

  /**
   * 部屋を削除します
   */
  async delete() {
    await this.#spreadsheetrow.delete()
  }

  /**
   * 試合をスタートさせるための諸々を行います。
   */
  async start() {
    const texts = {
      'description': {
        'japanese': '試合の準備ができました。タイトルのリンクから試合用チャンネルへ移動できます。',
        'english': 'Your match is ready to start! Click the title to jump to match text channel.',
      }
    }
    /** @type {Discord.Guild} */
    const guild = client.guilds.cache.get(DISCORD_GUILD_ID);
    /** @type {Discord.TextChannel} */
    const channel = await guild.channels.create(
      `room_${this.#number}`,
      { parent: '919059123738402837', permissionOverwrites: [ {id: guild.roles.everyone, deny: ['VIEW_CHANNEL']} ,]}
      );
    for (let i in this.#players) {
      await channel.permissionOverwrites.create(
        await client.users.fetch(this.#players[i].player.id), { VIEW_CHANNEL:true }
      )
    }
    const invite = await channel.createInvite();
    for(let i in this.#players) {
      const embed = new Discord.MessageEmbed()
        .setTitle('Are you ready?')
        .setURL(invite.url)
        .setDescription(texts.description[this.#players[i].player.language]);
      this.#players[i].player.sendDM({
        embeds: [embed,],
      })
    }
    this.#state = 1;
  }

  /**
   * 新しいSpreadSheetの行を作ってRoomクラスのインスタンスにして返します
   * @param {number} number 部屋の番号
   * @param {Player} player 部屋を立てたプレイヤー
   */
  static async create(number, player){
    const spreadsheetrow = await SPREADSHEET.sheetsByTitle['room'].addRow({
      'number': number,
      'state': STATE_STRING[0],
      'rank_min': player.rank.rank,
      'rank_max': player.rank.rank,
      'id0': player.id,
    });
    return new Room(spreadsheetrow);
  }
}