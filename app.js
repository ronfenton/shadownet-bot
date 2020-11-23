const Discord = require('discord.js')
const client = new Discord.Client();
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DB_ADDRESS,{useNewUrlParser:true,useUnifiedTopology:true});

const serverSchema = new mongoose.Schema ({serverID:"String"});
const userSchema = new mongoose.Schema ({discord_id:"String"});
const charSchema = new mongoose.Schema ({
    name: "String",
    dr: drSchema,
    def: "Number",
    initiative: "String",
    discord_id: "String",
    note: "String"
});
const drSchema = new mongoose.model({
    armour: "Number",
    bonus : "Number",
    hard  : "Number",
    body  : "Number"
})

const Server = mongoose.model("Server",serverSchema);
const User = mongoose.model("User",userSchema);
const Char = mongoose.model("Char",charSchema);
const DR = mongoose.model("DRVal",drSchema);

client.once('ready',() => {
    console.log('Ready!')
});

client.login(process.env.DISCORD_TOKEN)

client.on('message',message => {
    // message handling here.

    // if message originated from a bot; ignore it.
    if(message.author.bot){ return; }
    
    // identify if there's a command.
    let command = message.content.match(/\(([^)]+)\)/);
    if(command){
        console.log(command);
        shadowBot(command[1],message.channel,message.author);
    } 
    
})

function shadowBot(input,channel,user){
    
    if(/^\d/.test(input)){
        // if it's a number, do stuff here.
        let ndie = Number(input.match(/\d+/g));
        let nhits = 0;
        let nsequence = [];
        for(let i = 0; i < ndie; i++){
            let roll = Math.ceil(Math.random()*6);
            if(roll >= 5){
                nhits++;
            }
            nsequence.push(roll);
        }
        channel.send(`<@${user.id}> You got **${nhits}** hits. \`[${nsequence.join(", ")}]\``);
    } else {
        let inst = input.toUpperCase().match(/^(\w{1,5}[-:=+]?)\s?([-+\d\w\s]+)?/);
        if(inst){
            let task = inst[1];
            let args = inst[2];
            ((args === undefined) ? args = [] : args = args.split(" "));
            // handle here.

        }
    }
}