module.exports = {
  charHandler: charHandler,
  getActiveCharacter:getActiveCharacter
}

const mongoose = require("mongoose");
const { strToArgs } = require("./shadownet");
const shadownet = require(__dirname + "/shadownet.js")

const characterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    def: { type: Number, default: 0 },
    soak: {
      body: { type: Number, default: 0, required: true },
      temp: { type: Number },
    },
    armour: {
      armour: { type: Number, default: 0, required: true },
      temp: { type: Number },
      hard: { type: Number },
    },
    flags: {
      gremlins: {type: Number}, nostun: {type: Boolean}, friendly: {type: Boolean}
    },
    initiative: {
      meat: {
        type: String,
        default: "1d",
        required: true,
      },
      matrix: { type: String },
      astral: { type: String },
    },
    resources: {
      nuyen: { type: Number, default: 0, required: true },
      cred: { type: Number, default: 0, required: true },
      not: { type: Number, default: 0, required: true },
      karma: { type: Number, default: 0, required: true },
    },
    note: { type: String },
    owner_id: { type: String },
  },
  { minimize: false }
);
const Character = mongoose.model("Character", characterSchema);

///// CHARACTER MANAGEMENT
function charHandler(clan, player, actor, subcommand, argString) {

  // The first set of commands here are character management;
  // so ignore Actor overrides.
  if(subcommand === "new"){
    addNewCharacter(clan,player,argString);
    return;
  }
  if(subcommand === "change"){
    changeCharacter(clan,player,argString);
    return;
  }
  
  switch (subcommand) {
    case "soak":
      shadownet.repatchArgs(actor.soak, shadownet.strToArgs(argString," "), "body");
      break;
    case "armour":
      shadownet.repatchArgs(actor.armour, shadownet.strToArgs(argString," "), "armour");
      break;
    case "flags":
      shadownet.repatchArgs(actor.flags, shadownet.strToArgs(argString," "), "armour");
      break;
    case "nuyen":
    case "karma":
    case "cred":
    case "not":
      actor.resources[subcommand] = shadownet.stringMath(
        actor.resources[subcommand],
        argString
      );
      break;
    case "name":
    case "note":
      actor[subcommand] = argString;
      break;
    case "info":
      console.log(actor);
      break;
    default:
      break;
  }
}

function changeCharacter(clan,player,name){
  const character = getCharByName(clan,player,name);
  console.log("Character change request");
  if(character){
    if(character.owner_id == player._id){
      player.active = character._id;
      console.log(`Player <${player.friendly_name}> set active character to <${character.name}>`)
    } else {
      console.log(`WARN: Player <${player.friendly_name}> does not own character <${character.name}>`)
    }
  } else {
    console.log(`WARN: Character <${name}> not found in Clan <${clan.name}>`);
  }
}

function getActiveCharacter(clan,player){
  const [character] = clan.characters.filter((char) => char._id == player.active);
  return(character);
}

function getCharByName(clan,player,name){
  const [character] = clan.characters.filter((char) => char.name == name);
  return character;
}

function addNewCharacter(clan,player,name){
  const [existingChar] = clan.characters.filter((char) => char.name == name);
  if(existingChar){
    console.log(`WARN! Character by name <${name}> already exists.`)
    return;
  }
  const newChar = new Character({
    name: name,
    owner_id: player._id,
  });
  player.active = newChar._id;
  clan.characters.push(newChar);
  return newChar;
}

// Determines the current character; allows a text-based
// override to return a different character.
