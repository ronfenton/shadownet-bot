const Discord = require("discord.js");
const client = new Discord.Client();

// primary logic / handling.
const shadownet = require(__dirname + "/funcs/shadownet.js")

// MongoDB Schemas, DBs Setup.
const {Clan} = require(__dirname + "/funcs/db.js");


client.once("ready", () => {
  console.log("Bot now live and listening");
});

client.login(process.env.DISCORD_TOKEN);

client.on("message", (message) => {
  // message handling here.

  // if message originated from a bot; ignore it.
  if (message.author.bot) {
    return;
  }

  const input = message.content.match(
    /(?<=\()(?<actor>[\w\s]+(?=!))?!?(?<command>combat|player|char|[\d]+[!egw]*)(?:\s(?<subcommand>[\w]+))?(?:\s(?<args>[^\)]+))?(?=\))/i
  );
  if (input === null) {
    return;
  } 
  const request = input.groups;

  Clan.findById(message.guild.id, function (err, clan) {
    if (!err) {
      if (clan === null) {
        const newClan = new Clan({
          _id: message.guild.id,
          name: message.guild.name,
        });
        message.channel.send(`**ShadowNET** has now been activated on this Discord Server as \` ${newClan.name} \`\n> *And remember; never trust a dragon*`)
        newClan.save();
        return;
      } 
      const player = clan.getPlayerByDiscordMember(message.member);
      if(!player){
        const newPlayer = clan.addPlayerFromDiscordMember(message.member);
        message.channel.send(`<@${newPlayer.discord_id}>; Welcome to ShadowNET, your account has been created.`);
        clan.save();
        return;
      }
      shadownet.handleTask(clan, player, request, message.channel);
      clan.save();
      
    } else {
      console.log(err);
    }
  });
});
