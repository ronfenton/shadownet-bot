const utils = require(__dirname + "/utils.js");
module.exports = combatManager;

function combatManager(clan,player, actor, request, cb) {
  try {
    const { subcommand, args: argString } = request;
    const args = utils.strToArgs(argString, " ");
    switch (subcommand) {
      case "defend":
        defenseTest(player,actor,args,cb);
        break;
      case "resist":
        resistTest(player,actor,args,cb);
        break;

      // initiative related
      case "join":
        clan.combat.addCombatant(actor,args)
        break;
        case "next":
          clan.combat.nextCombatant()
          break;
      case "leave":
        break;
      case "delay":
        break;
      case "blitz":
        break;
      case "init":
        break;
      case "clear":
        clan.combat.clear();
        break;
    }
  } catch (err) {
    console.log(err);
  }
}

function defenseTest(player,actor,args,cb){
  console.log("got here");
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
}

function resistTest(player,actor,args,cb){

  // check if Actor is valid / defined enough.
  if(!actor && (!args.armour || !args.body)){
    throw new Error("Could not perform DR Test; requires either active actor, or both Armour# and Body# parameters.")
  }
  const {p:phys,s:stun} = args;
  const ap = args.ap || 0;
  const armour = (args.armour || actor.getNetArmour()) + ap;
  const soak = args.body || actor.getNetSoak();
  const resistDie = Math.max(0,armour) + soak;
  const dmg = phys || stun || 0;
  const resistRoll = utils.shadowRoll(resistDie,false,player);
  const freeHits = Math.floor((actor.armour.hard + Math.min(ap,0))/2);
  const injury = dmg - resistRoll.hits - freeHits;
  
  if(!phys && !stun){
    cb(
      false,
      `**${actor.name}** scored **${resistRoll.hits}${(freeHits) ? ("(+"+freeHits+" hardened bonus)") : ""} hits**. ` +
      `\`[${resistRoll.rollsets.join("] => [")}]\``
    )
    return;
  }
  if(injury <= 0){
    cb(
      false,
      `**${actor.name}** scored **${resistRoll.hits}${(freeHits) ? ("(+"+freeHits+" hardened bonus)") : ""} hits**, completely `+
      `negating all incoming damage. \`[${resistRoll.rollsets.join("] => [")}]\``
    )
    return;
  }
  if(injury < armour && phys){
    cb(
      false,
      `**${actor.name}** scored **${resistRoll.hits}${(freeHits) ? ("(+"+freeHits+" hardened bonus)") : ""} hits**, `+
      `taking **${injury} Stun** as injury. \`[${resistRoll.rollsets.join("] => [")}]\``
    )
    return;
  } else {
    cb(
      false,
      `**${actor.name}** scored **${resistRoll.hits}${(freeHits) ? ("(+"+freeHits+" hardened)") : ""} hits**, `+
      `taking **${injury} Physical** as injury. \`[${resistRoll.rollsets.join("] => [")}]\``
    )
    return;
  }
}
