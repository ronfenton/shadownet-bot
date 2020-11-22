const Discord = require('discord.js')
const client = new Discord.Client();
require('dotenv').config();

client.once('ready',() => {
    console.log('Ready!')
});

client.login(process.env.DISCORD_TOKEN)

client.on('message',message => {
    // message handling here.
    let command = message.content.match(/\(([^)]+)\)/);
    if(command){
        console.log("received instruction "+command[1]);
        message.channel.send("I received your request to do this:\n `"+command[1]+"`");
    } else {
        console.log("Everything's OK here.");
    }
})