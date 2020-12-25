const mongoose = require("mongoose");
const combatManager = require("./combat");
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
        default: "2+1d",
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
characterSchema.methods.defenseRoll = function(args,player){
  const mod = (args.default_key) ? args.default_key : 0;
  const wound = (this.wound_pen) ? this.wound_pen : 0;
  const roll = utils.shadowRoll(this.def+mod+wound,false,player);
  console.log(roll)
  return roll;
}
characterSchema.methods.getNetArmour = function(){
  return utils.sumvalues(this.armour);
}
characterSchema.methods.getNetSoak = function(){
  return utils.sumvalues(this.soak);
}

// Player
const playerSchema = new mongoose.Schema({
  discord_id: { type: String, required: true },
  active: String,
  friendly_name: String,
  rollstats: { default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }},
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

  const clan = this.parent();
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

const combatantSchema = new mongoose.Schema({
  char_id: String,
  blitz: { type: Boolean, default:false },
  seize: { type: Boolean, default:false },
  initiative: { type: Number, default:0 },
  delayto: { type: Number },
  hidden: { type: Boolean, default:false }
})

// Combat
const combatSchema = new mongoose.Schema({
  active: {type: [combatantSchema], required: true, default: []}, 
  acted: {type: [combatantSchema], required: true, default: []},
  inactive: {type: [combatantSchema],required:true,default:[]},
  pass: {type: Number, default: 0},
  started: {type: Boolean, default: false}
})
combatSchema.methods.sortInit = function(){
  this.active.sort((a,b) => {
    if(a.seize && b.seize){
      if((a.delayto || a.initiative) > (b.delayto || b.initiative)){ return -1; }
      if((a.delayto || a.initiative) < (b.delayto || b.initiative)){ return 1; }
      return 0;
    }
    if(a.seize){ return -1; }
    if(b.seize){ return 1; }
    if((a.delayto || a.initiative) > (b.delayto || b.initiative)){ return -1; }
    if((a.delayto || a.initiative) < (b.delayto || b.initiative)){ return 1; }
    return 0;
  });
}
combatSchema.methods.startCombat = function(){
  const newArr = this.active.concat(this.acted,this.inactive);
  this.sortInit();
  this.active.forEach((element) => console.log(`${element.initiative}: Unknown Character at ID ${element.char_id}`))
}
combatSchema.methods.addCombatant = function(actor,args){
  const [existingCombatant] = this.active.filter((item) => item.char_id == actor._id)
  if(existingCombatant){
    console.log("This character is already in the initiative");
    return;
  }
  const initiative = 
    (args.default_key) || 
    (args.matrix && actor.initiative.matrix) ||
    (args.astral && actor.initiative.astral) ||
    actor.initiative.meat;
  const roll = utils.initRoll(initiative,args.blitz);
  const combatant = new Combatant({char_id:actor._id,initiative:roll.score});
  this.active.push(combatant);
  this.sortInit();
  this.showOrder();
}
combatSchema.methods.showOrder = function(){
  const characters = this.parent().characters;
  console.log("Initiative Order Follows");
  this.active.forEach(function(element) {
    const [character] = characters.filter((item) => item._id == element.char_id);
    console.log(`${element.initiative}: ${character.name}`);
  })
  console.log("End Initiative");
}
combatSchema.methods.clear = function(){
  this.active.splice(0,this.active.length);
  this.inactive.splice(0,this.inactive.length);
  this.acted.splice(0,this.acted.length);
}

// Clan
const clanSchema = new mongoose.Schema({
  gms: { type: [String], default: [] },
  players: { type: [playerSchema], default: [] },
  characters: { type: [characterSchema], default: [] },
  npcrole: String,
  _id: String,
  name: String,
  flags:{},
  combat: combatSchema
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
clanSchema.methods.newCombat = function(){
  this.combat = new Combat({});
}

const Player = mongoose.model("Player", playerSchema);
const Clan = mongoose.model("Clan", clanSchema);
const Combat = mongoose.model("Combat", combatSchema);
const Combatant = mongoose.model("Combatant", combatantSchema);
const Character = mongoose.model("Character", characterSchema);

module.exports = {
  characterSchema: characterSchema,
  playerSchema: playerSchema,
  clanSchema: clanSchema,
  Character: Character,
  Player: Player,
  Clan: Clan,
};
