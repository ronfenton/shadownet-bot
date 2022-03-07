module.exports = {
  handleTask: handleTask
}

const charMgr = require(__dirname + "/char.js");
const playerMgr = require(__dirname + "/player.js");
const combatMgr = require(__dirname + "/combat.js");
const utils = require(__dirname + "/utils.js")

function simpleTest(die,player,actor,args){
  const roll = utils.srRoll(die,player,actor,args);
  if(roll.fails > roll.glitchThreshold){
    if(roll.hits != 0){
      return `**Glitched** with **${roll.hits} Hits** \`[${roll.rollsets.join("] => [")}]\``;
    } else {
      return `**Critical Glitch!** \`[${roll.rollsets.join("] => [")}]\``;
    }
  } else {
    return `**${roll.hits} Hits** \`[${roll.rollsets.join("] => [")}]\``;
  }
}

function handleTask(clan, player, request, channel) {

  function sendIt(err,str){
    if(err){
      channel.send(`<@${player.discord_id}> ${err}`);
      return;
    } 
    channel.send(`<@${player.discord_id}> ${str}`);
    return;
  }

  const actor = player.getActiveCharacter(request.actor);

  if(!actor){
    console.log(`Note; No Valid Actor. Some actions will fail by design.`)
  }
  console.log(request.command);
  const diceTest = request.command.match(/^(?<die>[\d]+)(?<args>[egw!]*)$/);
  const diceWithMods = request.command.match(/^(?<die>[\d]+)d6\+?(?<mod>[-\d]+)?$/)
  if (diceTest) {
    console.log("Got here???");
    const roll = simpleTest(
        Number(diceTest.groups.die),
        player,
        actor,
        utils.strToArgs(diceTest.groups.args,"")
      );
    sendIt(roll);
  } else if (diceWithMods) {
    console.log("got here");
    const nDie = Number(diceWithMods.groups.die);
    const nMod = diceWithMods.groups.mod ? Number(diceWithMods.groups.mod) : 0;
    let die = [];
    for(let x = 0; x < nDie; x++) {
      die.push(Math.ceil(Math.random()*6));
    }
    console.log(diceWithMods.groups);
    const sum = die.reduce((item, acc) => acc += item);
    const dieString = `[${die.join(", ")}]`
    const modString = nMod !== 0 ? (nMod < 0 ? `${nMod}` : `+${nMod}`) : "";
    sendIt(`Rolling ${nDie}d6${modString}. \`${dieString}${modString}\` = ${sum+nMod}`);
  } else {
    switch (request.command.toLowerCase()) {
      case "char":
        charMgr(player,actor,request,sendIt);
        break;
      case "player":
        playerMgr(player,request,sendIt);
        break;
      case "combat":
        combatMgr(clan,player,actor,request,sendIt);
        break;
      default:
        break;
    }
  }
}