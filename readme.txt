So been doing a little testing with this Bot and it's surprisingly straightforward (which of course means I'll make a fuckton of goofs from overconfidence). So I set out a simple plan for it as follows;

Planned design.

For all commands, must be flanked by ().

# = roll # die
#! = roll # exploding die
#e = Start extended test.

command arg arg arg arg = perform command with [args]. *not order specific*
each arg will either be text or text#.

Anything in [] is *optional* flags for added function.

i= #d#+# [Matrix/Astral] = Set and roll initiative to #d#+#. Flags will save alternate ini scores.
i [Matrix/Astral] = Roll initiative. Flag will roll alternate saved ini score.
i+ # = modify initiative.
i- # = minus initiative.
iset # = Sets initiative to a specific number. Not set to = because it's going to be used far less than just setting ini die.
dr= # [Bod#, Bonus#, Hard#] = Set DR, optional flags for Body, Hardened, and Bonus.
dr [#P or #S, AP-#] = Roll DR test against that damage.
def= # = Set defense die.
def [#, #P/#S] = Roll defense die. If damage provided, automatically work out net hits + damage if failed.
note = Accepts no args, sets note to remainder of string.

!<string>:<command> = Perform above for any NPC agent. EG, (!Harriet Jones:5) will roll 5 die for Harriet Jones. (!Jack:def 24) will roll Jack's defense die and indicate net hits against 24.