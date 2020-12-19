module.exports = {
  handleTask: handleTask
}

const charMgr = require(__dirname + "/char.js");
const playerMgr = require(__dirname + "/player.js");
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

  const diceTest = request.command.match(/^(?<die>[\d]+)(?<args>[egw!]*)$/);

  if (diceTest) {
    const roll = simpleTest(
        Number(diceTest.groups.die),
        player,
        actor,
        utils.strToArgs(diceTest.groups.args,"")
      );
    sendIt(roll);
  } else {
    switch (request.command.toLowerCase()) {
      case "char":
        charMgr(player,actor,request,sendIt);
        break;
      case "player":
        playerMgr(player,request,sendIt);
        break;
      default:
        break;
    }
  }
}