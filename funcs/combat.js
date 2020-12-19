const db = require("./db");

module.exports = combatManager;

function combatManager(clan,player,actor,request,cb){
  try{    
    const {subcommand,args:argString} = request;
    const args = strToArgs(argString," ")
    switch(subcommand){
      case ("defend"):
        actor.defend(args);
        cb(false,"Reached Defend");
        break;
      case ("resist"):

        break;

      // initiative related
      case ("join"):

        break;
      case ("leave"):

        break;
      case ("delay"):

        break;
      case ("blitz"):
      
        break;
      case("init"):

        break;
    }
  } catch (err){
    cb(err);
  }
}