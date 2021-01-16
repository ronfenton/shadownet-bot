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
(char armour <any of Armour#, Hard#, Temp#, Aug#>) sets the character's armour. If keyword omitted, assumes armour. (set armour 10) or (set armour hard25)
(char soak <any of Bod#, Temp#, Aug#>) sets the characters body soak. If keyword omitted, assumes body. (set soak 7) or (set soak temp2)
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
(char unset) clears your active character. Most useful for GMs.

Setting up your Player (A lot of this is default)
(player name <Any Player Name>) changes your friendly player name.
(player info) Will present a set of information specific to your player account.
(player flag <Any Flag>) adds a flag. Prepend the flag name with a dash (-) to remove it instead.

// USING THE BOT //
Combat
(combat defend <#> <vs#>) performs a defense test, with a given modifier. If provided, the vs# indicates how many hits your opponent rolled, to auto-determine pass/fail.
(combat resist <ap#> <dmg#>) performs a standard damage resistance test, automatically determining Physical to Stun conversion.
(combat join <Meat, Astral, Matrix> <#> <hotsim,blitz>) Joins the fight at a given initiative. If type omitted, meatspace assumed. Optional provision of flat +/- mod.
(combat init <-#, +#, or =#>) Modifies existing initiative score.
(combat delay <# or 'last'>)  Delays your action for this pass until the specified number, or until the last person.
(combat blitz) Edge option; gives you the maximum of +5d6.
(combat seize) Edge option; enforces you act first in every pass this *turn*.
(combat leave) Removes the given character from the combat chart.
(combat end) Ends the combat, terminating it.

// GM SPECIFIC//
NPC Actors
(<Name>!<any other command>) Perform any action as any other character.
(npc save <name>) Saves an NPC under this name.
(npc remove <name>) Removes the NPC.
(npc promote <name>) Changes an NPC into a DM-Owned PC.
(npc demote <name>) Changes a PC into an NPC.
(npc import {<json>}) Can be used to quickly insert an NPC using JSON.
Notes about NPC actors; 
 - 'Unsaved' NPC actors only exist during their function call. EG; (Bob!5) doesn't save bob at all, performing only a single 6-dice test.
 - NPCs have to have the <team> flag to be included in any team-based actions.
 - All characters have default-stats of 0; this allows you to replace the 'modifier' in most functions with your target number for unsaved/quick NPCs. EG; (Bob!combat defend 12 vs6) will roll 12 (0+12) vs 6 hits.

Team Management
(team join <Meat, Astral, or Matrix>) All players join the fight using either the selected Initiative (if listed), or Meatspace Initiative.
(team info) Indicates the current team.
(team role <@mention>) Sets the team's Discord role.

Server Settings
GM Only
(server info) Presents a set of info about the server, such as NPCs, Characters, etc.
(server npcrole <@mention>) Updates the npcrole for NPC Initiative pings.
(init start) Starts a new Combat Turn with all current NPC Actors.
(init stop) Clears combat status entirely, also terminates any 'Temp' mods.

Flags
Character Flags
nostun - Appropriate for Vehicles and Drones; prevents stun damage entirely.
gremlin# - Sets a Gremlin variable for the character. Any die roll appended with g will be subjected to it.
team - for NPCs; has them be classified as team members, despite being NPCs
npc - adjusts for some NPC mechanics.
nocombat - ignores this character for initiative entirely
hidden - hides this character from initiative order.

Server Flags
allowPCNPCs - Allows characters to have NPC ownership. If false; all NPCs are under GM control only.