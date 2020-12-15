const Discord = require("discord.js");
const client = new Discord.Client();
const mongoose = require("mongoose");
const shadownet = require(__dirname + "/funcs/shadownet.js")

require("dotenv").config();

mongoose.connect(process.env.DB_ADDRESS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
const playerSchema = new mongoose.Schema({
  characters: { type: [String], default: [] },
  discord_id: { type: String, required: true },
  active: String,
  friendly_name: String,
  rollstats: { type: Object, default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } },
});
const clanSchema = new mongoose.Schema({
  gms: { type: [String], default: [] },
  players: { type: [playerSchema], default: [] },
  npcs: { type: [characterSchema], default: [] },
  characters: { type: [characterSchema], default: [] },
  npcrole: String,
  _id: String,
  name: String,
});

const Player = mongoose.model("Player", playerSchema);
const Clan = mongoose.model("Clan", clanSchema);

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
    /(?<=\()(?<actor>[\w\s]+(?=!))?!?(?<command>char|def|resist|init|info|[\d]+[!egw]*)(?:\s(?<subcommand>[\w]+))?(?:\s(?<args>[^\)]+))?(?=\))/i
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
        newClan.save();
        console.log(
          `Discord Guild not already recorded; Clan ${newClan._id} saved as ${newClan.name}`
        );
      } else {
        const player = getPlayer(clan, message.member);
        const msgArr = [`<@${player.discord_id}>`];
        shadownet.handleTask(clan, player, request, msgArr);

        clan.save();
        message.channel.send(msgArr.join("\n").trim());
      }
    } else {
      console.log(err);
    }
  });
});

// Returns a given player from a specific mongo Clan object,
// using the discord's member details. Clan should be a
// clanSchema, d_member should be a guild.Member or message.member object.
// If no player exists; creates new and returns. Always returns a Player.
function getPlayer(clan, d_member) {
  const [existing] = clan.players.filter(
    (item) => item.discord_id === d_member.id
  );
  if (existing) {
    return existing;
  }

  const newPlayer = new Player({
    discord_id: d_member.id,
    friendly_name: d_member.displayName,
  });
  console.log(
    `Existing player not found on guild ${clan.name}; new player ${newPlayer._id} saved as ${newPlayer.friendly_name}`
  );
  clan.players.push(newPlayer);
  return newPlayer;
}












