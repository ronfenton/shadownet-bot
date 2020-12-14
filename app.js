const Discord = require('discord.js')
const client = new Discord.Client();
const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.DB_ADDRESS,{useNewUrlParser:true,useUnifiedTopology:true});

const characterSchema = new mongoose.Schema({
    name: String,
    def: {type: Number,default:0},
    flags: {type: [String],default:[]},
    initiative: {type: String,default:"1d6+1"},
    note: {type: String,default:""},
    owner_id:String
})
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
    
    let input = message.content.match(/(?<=\()(?<actor>[\w\s]+(?=!))?!?(?<command>set|def|resist|init|info|[\d]+[!egw]*)(?:\s(?<args>[^\)]+))?(?=\))/i);
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

    let command = request.command;
    let args = request.args;
    let actor;
    if(request.actor){
        // create or use existing actor / NPC 
    } else if (player.active) {
        // use player's active character
    } 

    // TEMPORARY ACTOR FOR TESTING / DEVELOPMENT.
    actor = new Character({name:"test",owner_id:"abcdefghijklmnop"})

    let diceTest = command.match(/^(?<die>[\d]+)(?<args>[egw!]+)?/);

    if(diceTest){
        if(diceTest.groups.args) {
            args = arrToArgs(diceTest.groups.args.split(""));
        }
        console.log(srRoll(Number(diceTest.groups.die),player,args));
    } else {
        if(args) { args = arrToArgs(args.split(/\s/))}
        switch(command){
            
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

function arrToArgs(arr){
    let obj = {};
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
    console.log(obj);
    return obj;
}