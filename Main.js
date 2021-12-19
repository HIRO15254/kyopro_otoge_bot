const { Client, Intents } = require('discord.js');
const fs = require('fs');

const botFiles = fs.readdirSync('./bots');
botFiles.forEach(element => {
	f = require('./bots/' + element);
	f.awake(false);
});
const f = require('./ArcaeaLinkPlayLeagueBot/base.js');
f.awake();