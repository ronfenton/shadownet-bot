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
