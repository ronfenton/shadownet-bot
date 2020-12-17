module.exports = {
  stringMath:stringMath,
  strToArgs:strToArgs,
  srRoll: srRoll
}

// Converts a string to a set of args in a singular object.
function strToArgs(input, delimiter) {
  const obj = {};
  if (!input) {
    return obj;
  }
  const arr = input.split(delimiter);
  arr.forEach(function (element) {
    const match = element.match(/^(?<name>[A-Za-z!]+)?(?<val>[-+\dd]+)?$/);
    if (match) {
      let {name:key,val} = match.groups;

      console.log(`key ${key} val ${val}`);

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
      if (/^\+?[-\d]+$/.test(val)) {
        val = Number(val.match(/[-\d]+/));
      }
      obj[key] = val;
    }
  });
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