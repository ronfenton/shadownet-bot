const manager = require("./char");

module.exports = playerManager;

function playerManager(player,request,cb){
  const {subcommand,args:argString} = request;
  switch(subcommand.toLowerCase()){
    case ("name"):
      player.friendly_name = argString;
      cb(false,`Your player name has been changed to ${argString}`)
      break;
    case ("info"):
    case ("debug"):
      cb(false,player);
      break;
    default:
      break;
  }
}