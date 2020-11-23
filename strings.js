// Help Texts.
const help= {
    all:
        `ShadowNet is a bot for facilitating Shadowrun 5 Gameplay in Discord. It is currently WIP. Any function marked below with an asterisk is currently incomplete.

        **Using the Bot**
        All commands must be encapsulated in parenthesis, and use a keyword and-or symbol, followed by as many arguments seperated by spaces as desired.
        \`EG. (dr:5 hard3)\` sends the DR command with the parameters of 5 and Hard3.
        All optional arguments are listed in square brackets below.

        **Initiative**
        **i:** *XdY+Z* [Matrix / Astral / Meat]. Sets your Initiative Die (if no type set, assumes Meatspace)
        **i=** *X* [Matrix / Astral / Meat]. Sets your Initiative outright (if no type set, assumes Meatspace)
        **i+** *X* and **i-** *X*. Modifies your initiative by the set amount.

        **Defense**
        **def:** *X* [#P / #S]. Rolls your defense test against *X* enemy hits, to provide success/fail and margin of victory/loss.
        **def=** *X*. Sets your defence die.
        
        **Damage Resistance**
        **dr: []`
}