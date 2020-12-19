const mongoose = require("mongoose");
const { sumvalues } = require("./utils");
require("dotenv").config();

const utils = require(__dirname + "/utils.js");

mongoose.connect(process.env.DB_ADDRESS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Character
const characterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    def: { type: Number, default: 0 },
    soak: {
      body: { type: Number, default: 0, required: true },
      temp: { type: Number },
      aug: {type: Number }
    },
    armour: {
      armour: { type: Number, default: 0, required: true},
      temp: { type: Number },
      hard: { type: Number },
      aug: {type: Number}
    },
    flags: {
      gremlins: { type: Number },
      nostun: { type: Boolean },
      friendly: { type: Boolean },
    },
    initiative: {
      meat: {
        type: String,
        default: "1d",
        required: true,
      },
      matrix: { type: String },
      astral: { type: String }
    },
    resources: {
      nuyen: { type: Number, default: 0, required: true },
      cred: { type: Number, default: 0, required: true },
      not: { type: Number, default: 0, required: true },
      karma: { type: Number, default: 0, required: true },
    },
    wound_pen: {type: Number},
    note: { type: String },
    bio: {
      fake_name: {
        first: String,
        last: String
      },
      description: String,
      comments: [String]
    },
    owner_id: { type: String },
  },
  { minimize: false }
);
characterSchema.methods.getOwner = function () {
  const clan = this.parent();
};
characterSchema.methods.modifyResource = function(resource,string){
  this.resources[resource] = utils.stringMath(this.resources[resource],string);
}
characterSchema.methods.updateObjProperty = function(property,args){
  const existingProps = this[property];
  const schemaProps = characterSchema.obj[property];
  const default_keys = { armour: "armour", soak: "body", initiative: "meat" };
  const keys = Object.keys(args);
  for (var key in keys) {
    if(schemaProps.hasOwnProperty(keys[key]) || keys[key] === "default_key"){
      if (args[keys[key]] === false) {
        if (existingProps.hasOwnProperty(keys[key])) {
          existingProps[keys[key]] = undefined;
        }
      } else if (keys[key] == "default_key") {
        existingProps[default_keys[property]] = args[keys[key]];
      } else {
        existingProps[keys[key]] = args[keys[key]];
      }
    }
  } 
}
characterSchema.methods.delete = function(){
  const clan = this.parent();
  clan.characters.splice(clan.characters.indexOf(this),1)
}
characterSchema.methods.defend = function(args){

}
characterSchema.methods.getNetArmour = function(){
  return utils.sumvalues(this.armour);
}
characterSchema.methods.getNetSoak = function(){
  return utils.sumvalues(this.soak);
}
characterSchema.methods.resist = function(argString){
  const args = utils.strToArgs(argString," ");
  const sumvalues = (obj) => Object.keys(obj).reduce((acc, value) => acc + obj[value], 0);

  return armour;
}

// Player
const playerSchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  active: String,
  friendly_name: String,
  rollstats: { default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } },
  osName: String
});
playerSchema.methods.createCharacter = function (name) {
  const clan = this.parent();
  const [existingChar] = clan.characters.filter((char) => char.name === name);
  if (existingChar) {
    throw new Error(`Character **${name}** already exists.`);
  }
  const newChar = new Character({
    name: name,
    owner_id: this._id,
  });
  this.active = newChar._id;
  clan.characters.push(newChar);
  return newChar;
};
playerSchema.methods.changeCharacter = function (name) {
  const clan = this.parent();
  const [existingChar] = clan.characters.filter((char) => char.name === name);
  if (existingChar) {
    if (existingChar.owner_id == this._id) {
      this.active = existingChar._id;
    } else {
      const owner = existingChar.getOwner();
      throw new Error(`Character ${name} is owned by ${owner.name}.`);
    }
  } else {
    throw new Error(`Character ${name} does not exist.`);
  }
};
playerSchema.methods.getActiveCharacter = function (override) {
  console.log("Active Player = "+ this);

  const clan = this.parent();
  console.log(clan);
  if(override){
    const actor = clan.getCharacterByName(override);
    if(actor && (this.isGM() || (actor.owner_id == this._id))){
      return actor
    }
  }
  const [active] = this.parent().characters.filter(
    (character) => character._id == this.active
  );
  return active;
};
playerSchema.methods.isGM = function(){
  return this.parent().gms.includes(this._id);
}
playerSchema.methods.importCharacter = function(json) {
  const data = JSON.parse(json);
  const clan = this.parent();
  const[existingChar] = clan.getCharacterByName(data.name);
  if(existingChar){
    throw new Error(`Character **${name}** already exists`);
  } else {
    const newChar = new Character(data);
    newChar.owner_id = this._id;
    this.active = newChar._id;
    clan.characters.push(newChar);
    return newChar;
  }
}
playerSchema.methods.getAverageDie = function(){
  const rolls = this.rollstats;
  const nDie = (
    rolls["1"] + rolls["2"] + rolls["3"] + rolls["4"] + rolls["5"] + rolls["6"]);
  const nTotal = (
    (rolls["1"])+
    (rolls["2"]*2)+
    (rolls["3"]*3)+
    (rolls["4"]*4)+
    (rolls["5"]*5)+
    (rolls["6"]*6));
  return {
    allRolls: rolls,
    av: (nTotal/nDie)
  }
}

// Clan
const clanSchema = new mongoose.Schema({
  gms: { type: [String], default: [] },
  players: { type: [playerSchema], default: [] },
  characters: { type: [characterSchema], default: [] },
  npcrole: String,
  _id: String,
  name: String,
  flags:{}
},{minimize: false});
clanSchema.methods.getPlayerByDiscordMember = function (d_member) {
  const [existing] = this.players.filter(
    (item) => item.discord_id === d_member.id
  );
  return existing;
};
clanSchema.methods.addPlayerFromDiscordMember = function(d_member){
  const newPlayer = Player({
    friendly_name: d_member.displayName,
    discord_id: d_member.id
  })
  this.players.push(newPlayer);
  return newPlayer;
}
clanSchema.methods.getCharacterByName = function (name) {
  const [character] = this.characters.filter((item) => item.name === name);
  return character;
};

const Player = mongoose.model("Player", playerSchema);
const Clan = mongoose.model("Clan", clanSchema);
const Character = mongoose.model("Character", characterSchema);

module.exports = {
  characterSchema: characterSchema,
  playerSchema: playerSchema,
  clanSchema: clanSchema,
  Character: Character,
  Player: Player,
  Clan: Clan,
};
