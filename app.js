const Discord = require('discord.js')
const client = new Discord.Client();
const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.DB_ADDRESS,{useNewUrlParser:true,useUnifiedTopology:true});

const characterSchema = new mongoose.Schema({
    name: String,
    def: { type: Number,default:0 },
    soak: {
        body: { type: Number, default: 0, required: true},
        temp: { type: Number }
    },
    armour: {
        armour: {type: Number, default:0, required: true},
        temp: {type: Number},
        hard: {type: Number},
    },
    flags: {default: {}},
    initiative: {
        meat: {
            type: String,
            default: "1d",
            required: true
        },
        matrix: { type: String },
        astral: { type: String }
    },
    resources: {
        nuyen: {type: Number, default:0, required: true},
        cred: {type:Number, default:0, required: true},
        not: {type:Number, default:0, required: true},
        karma: {type:Number,default:0, required: true}
    },
    note: { type: String },
    owner_id:String
}, { minimize : false })
const playerSchema = new mongoose.Schema({
    characters: [String],
    discord_id: String,
    active: String,
    friendly_name: String,
    rollstats: {type: Object,default: {1:0,2:0,3:0,4:0,5:0,6:0}}
})
const serverSchema = new mongoose.Schema({
    gms: {type: [String],default:[]},
    players: {type: [playerSchema],default: []},
    npcs: {type: [characterSchema],default: []},
    characters: {type: [characterSchema],default: []},
    npcrole: String,
    _id: String,
    name: String
})

const Character = mongoose.model("Character",characterSchema);
const Player = mongoose.model("Player",playerSchema);
const Server = mongoose.model("Server",serverSchema);

client.once('ready',() => {
    console.log('Ready!')
    console.log("Current Guilds:");
    let guildArray = client.guilds;
    guildArray.cache.forEach(function(element){
        console.log("Member of "+element.name+" (id: "+element.id+")");
    });
    
});

client.login(process.env.DISCORD_TOKEN)

client.on('message',message => {
    // message handling here.

    // if message originated from a bot; ignore it.
    if(message.author.bot){ return; }
    
    let input = message.content.match(/(?<=\()(?<actor>[\w\s]+(?=!))?!?(?<command>char|def|resist|init|info|[\d]+[!egw]*)(?:\s(?<subcommand>[\w]+))?(?:\s(?<args>[^\)]+))?(?=\))/i);
    if(input === null) { return; }
    else {input = input.groups}
    // note; input.groups.actor = actor replacement, undefined if missing. command = command type. args = remaining string.

    Server.findById(message.guild.id,function(err,server){
        if(!err){
            if(server === null){
                console.log("Server not already logged; new reference made.")
                // if server not in mongoose, make new.
                server = new Server({
                    gms:[],
                    players:[],
                    npcs:[],
                    characters:[],
                    npcrole:"",
                    teamrole:"",
                    _id:message.guild.id,
                    name:message.guild.name
                })
            } 

            // return the player that made the message request.
            let player = server.players.filter(item => item.discord_id === message.member.id)[0];
            if(!player){

                console.log("Player not already logged; new reference made.")
                // if no player in server log; add new.
                player = new Player({
                    discord_id: message.author.id,
                    active: null,
                    friendly_name: message.member.displayName,
                    characters: [],
                })
                server.players.push(player);
            }

            handleTask(server,player,input);
            
            server.save();

        } else {
            throw new Error(err);
        }
    }) 
    
})

function handleTask(server,player,request){

    let actor;
    if(request.actor){
        // create or use existing actor / NPC 
    } else {
        actor = server.characters.filter(char => char._id == player.active)[0];
    } 

    let diceTest = request.command.match(/^(?<die>[\d]+)(?<args>[egw!]*)$/);

    if(diceTest){
        console.log(srRoll(
            Number(diceTest.groups.die),
            player,
            arrToArgs(diceTest.groups.args.split(""))
            ));
    } else {
        switch(request.command){
            case("char"):
                charHandler(server,player,actor,request.subcommand,request.args)
                break;
            default:
                break;
        }
    }

}

/* 
    Rolls nDie d6's and records the amount of hits (5 & 6),
    and glitches (1). Accepts arguments to adjust logic.
    args:
        player: provide a Player object to have die rolls
        contribute to recording of rolls for stats. 
        explode: makes 6's reroll for additional die.
    Returns an object as follows:
    { hit: Number, glitch: Number, rollsets: Array of Rollgroups, rolled: Number }
*/
function srRoll(nDie,player,args){

    if(!args){ args = {} }
    
    function roller(dice,reroll,player,counter){

        // if counter inexistent; make new one.
        if(!counter){
            counter = {hit:0, glitch:0, rollsets:[], rolled: 0}
        }

        // counter for second-pass dice.
        let moreDie = 0; rolled = [];
        
        // generate rolls equal to **dice**
        for(let x = 0; x < dice; x++){
            let roll = Math.ceil(Math.random()*6);
            if(roll>=5){ counter.hit++; }
            if(roll>=6){ moreDie++; }
            if(roll === 1){ counter.glitch++; }
            counter.rolled++;
            if(player) {player.rollstats[roll]++;}
            rolled.push(roll);
        }

        // push the roll set
        counter.rollsets.push(rolled);
        
        // if it was an edge roll; roll again with any extra die.
        if(reroll && moreDie > 0){
            nextRoll = roller(moreDie,reroll,player,counter);
        }

        return counter;
    }

    return roller(nDie,args["!"],player)
}

///// CHARACTER MANAGEMENT
function charHandler(server,player,actor,subcommand,argString){
    if(subcommand === "new"){
        console.log("Character Creation Beginning");
        console.log("Player's existing character is "+player.active);

        let newChar = server.characters.filter(char => char.name === argString)[0];

        if(!newChar){
            console.log("No Character Found; Creating New");
            newChar = new Character({
                name: argString,
                owner_id: player._id
            })
            player.characters.push(newChar._id)
            server.characters.push(newChar)
            player.active = newChar._id
        } else {
            if(newChar.owner_id != player._id){
                console.log("A character of this name already exists");
            } else {
                console.log("This character was already found as follows");
                player.active = newChar._id
                console.log(newChar);
            }
        }
        console.log("Player's character choice follows");
        console.log(player.active);
    } else if(subcommand === "change"){
        let newChar = server.characters.filter(char => char.name === argString)[0];

        if(newChar){
            if(newChar.owner_id == player._id){
                player.active = newChar._id
                console.log("Player's active character changed to --"+newChar.name+"--")
            } else {
                console.log("You do not own this character.");
            }
        } else {
            console.log("No character by this name exists. Use the --char new <name>-- command to create one.");
        }
    } else {
        if(!actor){
            console.log("No active character; please create a character using the --char new <name>-- command.");
            return;
        } 
        
        switch(subcommand){
            case("soak"):
                patchObj(actor.soak,argString,"body");
                break;
            case("armour"):
                patchObj(actor.armour,argString,"armour");
                break;
            case("flags"):
                patchObj(actor.flags,argString);
                break;
            case("nuyen"):
            case("karma"):
            case("cred"):
            case("not"):
                actor.resources[subcommand] = stringMath(actor.resources[subcommand],argString);
                break;
            case("name"):
            case("note"):
                actor[subcommand] = argString;
                break;
            default:
                break;
        }
    }
}

function stringMath(value,string){
    const FORCE_DECLARE = true;
    // if false; 25 will be treated as +25. If false, 25 will fail.
    // this prevents accidental addition when you intended to set, by 
    // forcing + and =.

    const extracted = string.match(/^(?<operand>[=+])?(?<numeral>-?\d+\.?\d*)$/)
    console.log(extracted);
    if(extracted){
        const x = Number(extracted.groups.numeral);
        if(extracted.groups.operand === "="){
            return x;
        } else {
            if(!FORCE_DECLARE){
                return value + x;
            } else if (extracted.groups.operand === "+" || x < 0){
                return value + x;
            } else {
                console.log("Invalid Sequence; No Change");
                return value;
            }
        }
    } else {
        return value;
    }
}

// applies all arguments as new properties to the object;
// however false instead removes the property, and 
// a string is provided to handle 'defaults'.
function patchObj(target,argString,defName){
    const args = arrToArgs(argString.split(" "));
    for(var arg in args){
        if(args[arg] === false){
            if(target.hasOwnProperty(arg)){
                // note to self; without using Stricts and other logic;
                // delete does not work as it uses patch-like logic, and just 
                // assumes no change. Declaring as 'undefined' removes the property.
                target[arg] = undefined;
            }
        } else if (arg === "default" && defName){
            target[defName] = args[arg]
        } else {
            target[arg] = args[arg]
        }
    }
    return target;
}

function arrToArgs(arr){
    let obj = {};
    if(!arr) { return obj }
    arr.forEach(function(element){
        let match = element.match(/^(?<name>[A-Za-z!]+)?(?<val>[-+\dd]+)?$/)
        if(match){
            let propname = match.groups.name;
            let propval = match.groups.val;

            // if no property name provided; assume it's the default case.
            if(!propname){
                propname = "default";
            }

            // if no value provided, assume it's a true flag.
            if(!propval){
                propval = true;
            }

            // if propval = -, set to 'false'.
            if(propval === "-"){
                propval = false;
            }

            // determine if value is a number.
            if(/\+?[-\d]+/.test(propval)){
                propval = Number(propval.match(/[-\d]+/));
            }
            obj[propname] = propval;
        }
    })
    return obj;
}