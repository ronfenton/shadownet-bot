

// takes an obj and sums all values; slightly edited to handle
// MongoDB objects which often have tertiary, hidden details.
const sumvalues = (obj) => Object.values(obj).filter((item) => Object.prototype.toString.apply(item) === "[object Number]").reduce((acc, n) => acc + n, 0);

// Converts a string to a set of args in a singular object.
function strToArgs(input, delimiter) {
  const obj = {};
  if (!input) {
    return obj;
  }
  const arr = input.split(delimiter);
  arr.forEach(function (element) {
    const match = element.match(/^(?<keya>[A-Za-z!]+)?(?<val>[-+\dd]+)?(?<keyb>[A-Za-z!]+)?$/);
    if (match) {
      let {keya:inputkeya,keyb:inputkeyb,val:inputval} = match.groups;
      let outputkey, outputval;

      // if no property name provided; assume it's the default case.
      if (!inputkeya && !inputkeyb){
        outputkey = "default_key";
      } else {
        outputkey = inputkeya || inputkeyb
      }

      // if no value provided, assume it's a true flag.
      if (!inputval) {
        outputval = true;
      }

      // if val = -, set to 'false'.
      if (inputval === "-") {
        outputval = false;
      }

      // determine if value is a number.
      if (/^\+?[-\d]+$/.test(inputval)) {
        outputval = Number(inputval.match(/[-\d]+/));
      } else {
        outputval = inputval
      }
      obj[outputkey] = outputval;
    }
  });
  console.log(obj);
  return obj;
}

// returns a modified value from a string adjustment
// of either +, =, or -.
function stringMath(value, string) {
  const FORCE_DECLARE = true;
  // if false; 25 will be treated as +25. If true, 25 will fail.
  // this prevents accidental addition when you intended to set, by
  // forcing + and =.

  const extracted = string.match(/^(?<operand>[=+])?(?<numeral>-?\d+\.?\d*)$/);
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
        return value;
      }
    }
  } else {
    return value;
  }
}

function shadowRoll(nDie,edge,player){

  function roller(dice, reroll, player, counter) {
    // if counter inexistent; make new one.
    if (!counter) {
      counter = { hits: 0, fails: 0, rollsets: [], rolled: 0 };
    }

    // counter for second-pass dice.
    let moreDie = 0;
    const rollset = [];

    // generate rolls equal to **dice**
    for (let x = 0; x < dice; x++) {
      const roll = Math.ceil(Math.random() * 6);
      if (roll >= 5) {
        counter.hits++;
      }
      if (roll >= 6) {
        moreDie++;
      }
      if (roll === 1) {
        counter.fails++;
      }
      counter.rolled++;
      if (player) {
        player.rollstats[roll]++;
      }
      rollset.push(roll);
    }

    // push the roll set
    counter.rollsets.push(rollset);

    // if it was an edge roll; roll again with any extra die.
    if (reroll && moreDie > 0) {
      nextRoll = roller(moreDie, reroll, player, counter);
    }
    return counter;
  }

  return roller(nDie,edge,player);
}

//rolls x die, counting fails (1) and hits (5 & 6).
//if player provided; tracks die rolls for stats.
//if actor provided, wound and gremlin effects are counted if appropriate.
//args w = wound applies, g = gremlin applies, ! = exploding 6's.
// returns an object with Hits, Fails, Rollsets, Rolled, and Glitch Threshold
function srRoll(x, player, actor, args) {
  const glitchAdjust = getGlitchAdjust(actor, args);
  const die = getRollAmount(actor, args) + x;
  const dieRoll = roller(die, args["!"], player);
  dieRoll.glitchThreshold = Math.max(dieRoll.rolled / 2 - glitchAdjust, 0);

  return dieRoll;

  function getGlitchAdjust(actor, args) {
    if (args.g && actor && actor.flags.gremlins) {
      return actor.flags.gremlins;
    }
    return 0;
  }

  function getRollAmount(actor, args) {
    if (args.w && actor && actor.wound_pen) {
      return actor.wound_pen;
    }
    return 0;
  }

  function roller(dice, reroll, player, counter) {
    // if counter inexistent; make new one.
    if (!counter) {
      counter = { hits: 0, fails: 0, rollsets: [], rolled: 0 };
    }

    // counter for second-pass dice.
    let moreDie = 0;
    const rollset = [];

    // generate rolls equal to **dice**
    for (let x = 0; x < dice; x++) {
      const roll = Math.ceil(Math.random() * 6);
      if (roll >= 5) {
        counter.hits++;
      }
      if (roll >= 6) {
        moreDie++;
      }
      if (roll === 1) {
        counter.fails++;
      }
      counter.rolled++;
      if (player) {
        player.rollstats[roll]++;
      }
      rollset.push(roll);
    }

    // push the roll set
    counter.rollsets.push(rollset);

    // if it was an edge roll; roll again with any extra die.
    if (reroll && moreDie > 0) {
      nextRoll = roller(moreDie, reroll, player, counter);
    }

    return counter;
  }
}

module.exports = {
  stringMath:stringMath,
  strToArgs:strToArgs,
  srRoll: srRoll,
  sumvalues: sumvalues,
  shadowRoll: shadowRoll
}