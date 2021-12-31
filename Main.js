const fs = require('fs');

// const botFiles = fs.readdirSync('./bots');
const f = require('./bots/kyopro_otoge_bot.js');
f.awake(false);
const f2 = require('./bots/ArcaeaLinkPlayLeagueBot/base.js');
f2.awake();
const f3 = require('./bots/Arcaea_taikai_bot/base.js');
f3.awake();