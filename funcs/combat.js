const utils = require(__dirname + "/utils.js");
module.exports = combatManager;

function combatManager(player, actor, request, cb) {
  try {
    const { subcommand, args: argString } = request;
    const args = utils.strToArgs(argString, " ");
    switch (subcommand) {
      case "defend":
        const defenseRoll = actor.defenseRoll(args, player);
        if (args.vs) {
          if (args.vs <= defenseRoll.hits) {
            cb(
              false,
              `${actor.name} **successfully** defended by **${(defenseRoll.hits-args.vs)}** by scoring `+
              `${defenseRoll.hits} hits on ${defenseRoll.rolled} die. `+
              `\`[${defenseRoll.rollsets.join("] => [")}]\``
            );
          } else {
            cb(
              false,
              `${actor.name} **failed** to defend by **${(defenseRoll.hits-args.vs)*-1}** by scoring `+
              `${defenseRoll.hits} hits on ${defenseRoll.rolled} die. `+
              `\`[${defenseRoll.rollsets.join("] => [")}]\``
            );
          }
        } else {
          cb(
            false,
            `${actor.name} scored ${defenseRoll.hits} on ${
              defenseRoll.rolled
            } die. \`[${defenseRoll.rollsets.join("] => [")}]\``
          );
        }
        break;
      case "resist":
        resistTest(player,actor,args);
        break;

      // initiative related
      case "join":
        break;
      case "leave":
        break;
      case "delay":
        break;
      case "blitz":
        break;
      case "init":
        break;
    }
  } catch (err) {
    console.log(err);
  }
}

function resistTest(player,actor,args){

  // check if Actor is valid / defined enough.
  if(!actor && (!args.armour || !args.body)){
    throw new Error("Could not perform DR Test; requires either active actor, or both Armour# and Body# parameters.")
  }
  const {p:phys,s:stun} = args;
  const ap = args.ap || 0;
  const armour = (args.armour || actor.getNetArmour()) + ap;
  const soak = args.body || actor.getNetSoak();
  const resistDie = Math.max(0,armour) + soak;
  const dmg = phys || stun;
  const resistRoll = utils.shadowRoll(resistDie,false,player);
  const freeHits = Math.floor((actor.armour.hard - ap)/2);
  const injury = dmg - resistRoll.hits - freeHits;
  
  console.log(
    `armour = ${armour}
    soak = ${soak},
    resistDie = ${resistDie},
    dmg = ${dmg},
    resistRoll = ${resistRoll},
    injury = ${injury}`
  )

  if(injury <= 0){
    console.log("All damage resisted");
    return;
  }
  if(injury > armour && phys){
    console.log(`Resisted ${resistRoll.hits}${(freeHits) ? ("+"+freeHits+" hardened") : ""}. Remaining ${injury}P suffered. ${resistRoll.rollsets}`)
    return;
  } else {
    console.log(`Resisted ${resistRoll.hits}${(freeHits) ? ("+"+freeHits+" hardened") : ""}. Remaining ${injury}S suffered. ${resistRoll.rollsets}`)
  }
}
