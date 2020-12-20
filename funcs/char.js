const utils = require(__dirname + "/utils.js");
module.exports = charManager;

function charManager(player,actor,request,cb){
  try{
    const {subcommand,args:argString} = request;

    // these functions take strings.
    switch(subcommand.toLowerCase()){
      case("new"):
        player.createCharacter(argString);
        cb(false,`Character ${argString} successfully created.`);
        break;
      case("change"):
        player.changeCharacter(argString);
        cb(false,`Active character changed to ${argString}.`);
        break;
      case("debug"):
      case("info"):
        cb(false,`\`\`\`json\n${JSON.stringify(actor,null,2)}\`\`\``)
        break;
      case("import"):
        player.importCharacter(argString);
        cb(false,`Character imported successfully`);
        break;
      case("name"):
        actor.name = argString;
        cb(false,`Character renamed to ${actor.name}.`);
      case("note"):
        actor.note = argString;
        cb(false,`Character note updated.`);
        break;
      case("wound"):
        actor.wound_pen = Number(argString);
        cb(false,`Character wound penalty updated! ${actor.name}'s wound penalty is now: ${actor.wound_pen}`)
        break;
      case("def"):
        actor.def = Number(argString);
        cb(false,`Character defense updated! ${actor.name}'s defense pool is now: ${actor.def}`)
        break;
      case("delete"):
        actor.delete();
        cb(false,`Character ${actor.name} deleted.`)
        break;
      case("nuyen"): case("karma"): case("notoriety"): case("cred"):
        actor.modifyResource(subcommand,argString);
        cb(false,`Character ${subcommand} updated! ${actor.name} now has ${actor.resources[subcommand]} ${subcommand}`);
        break;
      default: 
        break;
    }

    // these functions take objects as arguments/flags.
    const args = utils.strToArgs(argString," ");
    switch(subcommand.toLowerCase()){
      case("soak"):
        actor.updateObjProperty(subcommand,args);
        cb(false,`Character ${subcommand} updated! ${actor.name}'s ${subcommand} is now: ${actor.getNetSoak()}`);
        break;
      case("armour"):
        actor.updateObjProperty(subcommand,args);
        cb(false,`Character ${subcommand} updated! ${actor.name}'s ${subcommand} is now: ${actor.getNetArmour()}`);
        break;
      case("flags"):
        actor.updateObjProperty(subcommand,args);
        cb(false,`Character flags updated! ${actor.name} now has the following flags: ${actor.flags}`);
        break;
      case("init"):
        actor.updateObjProperty("initiative",args);
        cb(false,`Character initiative updated! ${actor.name}'s initiative is now: ${actor.initiative}`);
        break;
      default:
        break;
    }
    
  } catch(err) {
    console.log(err);
    cb(err)
  }
}