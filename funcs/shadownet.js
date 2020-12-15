module.exports = {
  arrToArgs: arrToArgs,
  patchObj: patchObj,
  stringMath:stringMath,
  srRoll:srRoll,
  handleTask: handleTask,
  repatchArgs:repatchArgs,
  strToArgs: strToArgs
}

const charMgr = require(__dirname + "/characters.js");

function strToArgs(input, delimiter){
  const obj = {};
  if(!input){
    return obj;
  }
  const arr = input.split(delimiter);
  arr.forEach(function(element){
    const match = element.match(/^(?<name>[A-Za-z!]+)?(?<val>[-+\dd]+)?$/);
    if(match){
      let [key,val] = [match.groups.name,match.groups.val];

      // if no property name provided; assume it's the default case.
      if (!key) {
        key = "default_key";
      }

      // if no value provided, assume it's a true flag.
      if (!val) {
        val = true;
      }

      // if val = -, set to 'false'.
      if (val === "-") {
        val = false;
      }

      // determine if value is a number.
      if (/\+?[-\d]+/.test(val)) {
        val = Number(val.match(/[-\d]+/));
      }
      obj[key] = val;
    }
  })
  return obj;
}

function repatchArgs(target,source,default_key){
  console.log(`Target = ${JSON.stringify(target)}`)
  console.log(`Source = ${JSON.stringify(source)}`)
  const keys = Object.keys(source);
  for(var key in keys){
    console.log(`Attempting to update Target with ${keys[key]} : ${source[keys[key]]}`)
    if(source[keys[key]] === false){
      console.log("Val is set to false");
      if(target.hasOwnProperty(keys[key])){
        target[keys[key]] = undefined;
      }
    } else if (keys[key] === "default_key"){
      console.log("Key is default");
      target[default_key] = source[keys[key]]
    } else {
      console.log("Applied");
      target[keys[key]] = source[keys[key]]
    }
  }
  return target;
}

function arrToArgs(arr) {
  let obj = {};
  if (!arr) {
    return obj;
  }
  arr.forEach(function (element) {
    let match = element.match(/^(?<name>[A-Za-z!]+)?(?<val>[-+\dd]+)?$/);
    if (match) {
      let propname = match.groups.name;
      let propval = match.groups.val;

      // if no property name provided; assume it's the default case.
      if (!propname) {
        propname = "default";
      }

      // if no value provided, assume it's a true flag.
      if (!propval) {
        propval = true;
      }

      // if propval = -, set to 'false'.
      if (propval === "-") {
        propval = false;
      }

      // determine if value is a number.
      if (/\+?[-\d]+/.test(propval)) {
        propval = Number(propval.match(/[-\d]+/));
      }
      obj[propname] = propval;
    }
  });
  return obj;
}

// applies all arguments as new properties to the object;
// however false instead removes the property, and
// a string is provided to handle 'defaults'.
function patchObj(target, argString, defName) {
  const args = arrToArgs(argString.split(" "));
  console.log(args);
  for (var arg in args) {
    if (args[arg] === false) {
      if (target.hasOwnProperty(arg)) {
        // note to self; without using Stricts and other logic;
        // delete does not work as it uses patch-like logic, and just
        // assumes no change. Declaring as 'undefined' removes the property.
        target[arg] = undefined;
      }
    } else if (arg === "default" && defName) {
      target[defName] = args[arg];
    } else {
      target[arg] = args[arg];
    }
  }
  console.log(target);
  return target;
}

function stringMath(value, string) {
  const FORCE_DECLARE = true;
  // if false; 25 will be treated as +25. If true, 25 will fail.
  // this prevents accidental addition when you intended to set, by
  // forcing + and =.

  const extracted = string.match(/^(?<operand>[=+])?(?<numeral>-?\d+\.?\d*)$/);
  console.log(extracted);
  if (extracted) {
    const x = Number(extracted.groups.numeral);
    if (extracted.groups.operand === "=") {
      return x;
    } else {
      if (!FORCE_DECLARE) {
        return value + x;
      } else if (extracted.groups.operand === "+" || x < 0) {
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
function srRoll(nDie, player, args) {
  if (!args) {
    args = {};
  } 

  function roller(dice, reroll, player, counter) {
    // if counter inexistent; make new one.
    if (!counter) {
      counter = { hit: 0, glitch: 0, rollsets: [], rolled: 0 };
    }

    // counter for second-pass dice.
    let moreDie = 0;
    rolled = [];

    // generate rolls equal to **dice**
    for (let x = 0; x < dice; x++) {
      let roll = Math.ceil(Math.random() * 6);
      if (roll >= 5) {
        counter.hit++;
      }
      if (roll >= 6) {
        moreDie++;
      }
      if (roll === 1) {
        counter.glitch++;
      }
      counter.rolled++;
      if (player) {
        player.rollstats[roll]++;
      }
      rolled.push(roll);
    }

    // push the roll set
    counter.rollsets.push(rolled);

    // if it was an edge roll; roll again with any extra die.
    if (reroll && moreDie > 0) {
      nextRoll = roller(moreDie, reroll, player, counter);
    }

    return counter;
  }

  return roller(nDie, args["!"], player);
}

function handleTask(clan, player, request, msgArr) {

  const actor = determineActor(clan,player,request.actor);

  if(!actor){
    console.log(`Note; No Valid Actor. Some actions will fail by design.`)
  }

  let diceTest = request.command.match(/^(?<die>[\d]+)(?<args>[egw!]*)$/);

  if (diceTest) {
    const roll = srRoll(
        Number(diceTest.groups.die),
        player,
        arrToArgs(diceTest.groups.args.split(""))
      );
    msgArr.push(`You scored **${roll.hit}** hits: \`[${roll.rollsets.join("] => [")}]\``);
  } else {
    switch (request.command) {
      case "char":
        charMgr.charHandler(clan, player, actor, request.subcommand, request.args);
        break;
      default:
        break;
    }
  }
}
//
function determineActor(clan, player, override) {
  if (override) {
    const [[foundCharacter], [foundNPC]] = [
      clan.characters.filter((char) => char.name == override),
      clan.npcs.filter((char) => char.name == override),
    ];
    if (foundCharacter) {
      return foundCharacter;
    }
    if (foundNPC) {
      return foundNPC;
    }
    console.log(`WARN: No valid actor identified`);
  } else {
    const actor = charMgr.getActiveCharacter(clan,player);
    return actor;
  }
}