All commands are to be surrounded in parenthesis; these can be anywhere in any discord post. Anything in bolded brackets is for user entry. eg.
(set name <Character Name>) means to set your name to Bob, type (set name Bob). # is for inputting numbers.
Capitalisation is not important. It is ignored for anything that isn't a text entry (names and notes)


// SIMPLE TESTS //
Direct Checks / Tests
(#) Roll a simple test.
(#!) Roll a simple test with Exploding Sixes (Push the Limit)
(#e) Roll an extended test; after each roll, react to the message to roll again with -1 die and counting hits.
Note- you can append 'g' to any of these, to indicate that the character's Gremlins Rating (flag gremin#) applies; and w if your wound modifier applies.

// SETTING UP THE BOT //
Character Settings
(char name <Name>) sets the character's name. (set name Wheaton)
(char init <Initiative Die with Adds> <Meat, Astral, or Matrix>) sets the character's initiative die, and what type. If type is ommitted, defaults to Meatspace. (set i 3d6+9) or (set i 5d6+12 Matrix)
(char armour <any of Arm#, Hard#, Temp#>) sets the character's armour. If keyword omitted, assumes armour. (set armour 10) or (set armour hard25)
(char soak <any of Bod#, Temp#>) sets the characters body soak. If keyword omitted, assumes body. (set soak 7) or (set soak temp2)
(char def #) sets the character's defence pool against attacks. (set def 12)
(char note <Any Text>) updates a character note; this will appear during your initiative call-outs for reminders.
(char change <Any Character Name>) changes to a different saved character. If you try set this to a character that isn't recorded, this will ask if you wish to make a new one. (set character Bones)
(char flag <Any Flag>) adds a flag. Postpend the flag name with a dash (-) to remove it instead. (set flag spirit) or (set flag simhot-). Flags will affect secondary systems.
(char woundpen #) sets your current wound penalty; automatically affects initiative.
(char info) presents a section of character info.
(char karma #) adjusts karma +/-
(char cred #) adjusts street-cred +/-
(char notoriety #) adjusts notoriety +/-
(char nuyen #) adjusts nuyen +/-
(char transfer <PlayerName>) transfers a character to another player.

Setting up your Player (A lot of this is default)
(player name <Any Player Name>) changes your friendly player name.
(player info) Will present a set of information specific to your player account.
(player flag <Any Flag>) adds a flag. Prepend the flag name with a dash (-) to remove it instead.

// USING THE BOT //
Combat
(def <#> <vs#>) performs a defense test, with a given modifier. If provided, the vs# indicates how many hits your opponent rolled, to auto-determine pass/fail.
(resist <ap#> <dmg#>) performs a standard damage resistance test, automatically determining Physical to Stun conversion.
(init join <Meat, Astral, or Matrix> <#> <pass?>) Joins the fight at a given initiative. If type omitted, meatspace assumed. Optional provision of flat +/- mod.
(init <-#, +#, or =#>) Modifies existing initiative score.
(init remove) Removes the given character from the combat chart.

// GM SPECIFIC//
NPC Actors
(<Name>!<any other command>) Perform any action as any other character; if character doesn't exist, one is created as NPC. Note; when performed with the set init command, it automatically joins combat if ongoing.
(<Name>!remove) Removes the NPC.
(<Name>!promote) Changes an NPC into a DM-Owned PC.
(<Name>!demote) Changes a PC into an NPC.
(<Name>!import {<json>}) Can be used to quickly insert an NPC using JSON. 

Team Management
(team join <Meat, Astral, or Matrix>) All players join the fight using either the selected Initiative (if listed), or Meatspace Initiative.
(team info) Indicates the current team.
(team role <@mention>) Sets the team's Discord role.

Server Settings
GM Only
(server info) Presents a set of info about the server, such as NPCs, Characters, etc.
(set gmrole <@mention>) Updates the gmrole for NPC Initiative pings.
(init start) Starts a new Combat Turn with all current NPC Actors.
(init stop) Clears combat status entirely, also terminates any 'Temp' mods.

Flags and Effects
nostun - Appropriate for Vehicles and Drones; prevents stun damage entirely.
gremlin# - Sets a Gremlin variable for the character. Any die roll appended with g will be subjected to it.
friendly - for GM characters; has them show up in Team initiative.


expected characters;
\w (a-zA-Z0-9)
\s (whitespace)
! (for NPC commands and edge)
+ - = (for math commands; always preceeding \d)
@ (from mentions)
. (for notes only)