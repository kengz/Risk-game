# Risk-game
Implementation of the 2-player Risk game and the AI to play it, for Math 335 Probability project.

## Paper
More to come soon.

## Strategies
See strategies.md for more. Some rewrite required; coming soon.


## Data Output (Ben, read this)
Download the `data` folder for the `JSON` files and data-transformer. There's a smaller test file titled `GS_test_1_1_1.json` for your experimentation.

Each `GS` (game series) is the result of 100 games played on the same configuration, specified by the number trailing the file name. e.g. `GS_2_10_1` would be for AI1 with personality 2, AI2 with personality 10, and the player order is player-1 first.

Start from the controls, which are `GS_1_1_1.json` and `GS_1_1_2.json`.


#### The data structure of `GS`

Each `GS` is an object, i.e. data wrapped within a pair of braces `{}`, within it is more nested objects. Object is a collection of key-value map, with syntax `key: value`.

We now interpret the data object `GS`; most of it should be self-explanatory. Note I've changed the data structure so it's simpler and faster now.


```js
{   // this is the GS where we played 3 games
    "1": {  // game #1
        "first_player": "p1",   // id of player who goes first
        "winner": "p1",         // winner of this game ("tie" if none)
        "AI1": ["Survival", "agressive", "cautious", "rusher"],
        "AI2": ["Survival", "agressive", "cautious", "rusher"],
        // below are time series, i.e. values at successive time
        // this game has 3 turns, thus array length = 3
        "p1_countries": [14, 16, 12],   // # of countries of p1
        "p1_continents": [0, 0, 0],     // # of continents of p1
        "p1_army_given": [4, 0, 4],     // # of armies given
        "p1_total_army": [44, 41, 17],  // # of total armies on board
        "p2_countries": [14, 12, 16],
        "p2_continents": [0, 0, 0],
        "p2_army_given": [0, 4, 0],
        "p2_total_army": [40, 41, 62],
        "n_attacks": [3, 6, 2], // # of attacks, over all attacked nodes
        "n_conquered": [2, 4, 2] // # of nodes conquered
    },
    "2": {
        "first_player": "p1",
        "winner": "tie",
        "AI1": ["Survival", "agressive", "cautious", "rusher"],
        "AI2": ["Survival", "agressive", "cautious", "rusher"],
        "p1_countries": [14, 17, 16],
        "p1_continents": [0, 0, 0],
        "p1_army_given": [4, 0, 5],
        "p1_total_army": [85, 107, 79],
        "p2_countries": [14, 14, 16],
        "p2_continents": [0, 0, 0],
        "p2_army_given": [0, 4, 0],
        "p2_total_army": [54, 58, 84],
        "n_attacks": [8, 6, 8],
        "n_conquered": [3, 2, 4]
    },
    "3": {
        "first_player": "p1",
        "winner": "tie",
        "AI1": ["Survival", "agressive", "cautious", "rusher"],
        "AI2": ["Survival", "agressive", "cautious", "rusher"],
        "p1_countries": [14, 17, 13],
        "p1_continents": [1, 0, 0],
        "p1_army_given": [11, 0, 4],
        "p1_total_army": [144, 121, 77],
        "p2_countries": [14, 12, 16],
        "p2_continents": [0, 0, 0],
        "p2_army_given": [0, 4, 0],
        "p2_total_army": [113, 73, 110],
        "n_attacks": [8, 7, 7],
        "n_conquered": [3, 4, 3]
    }
}
```


<!-- 
{
    "1": { 	// game #1
        "1": { 	// game turn #1
            "turn": "p1", 	// who's playing this turn
            "p1": {		// fields for player 1
                "n_countries": 14,	// # of countries owned
                "n_continents": 0,	// # of continents owned
                "n_army_given": 4,	// # of armies given at turn
                "n_total_army": 44	// # of total armies owned on board
            },
            "p2": {...},	// fields for player 2, similar
            "n_attacks": 2,	// # of attacks, over all attacked nodes
            "n_conquered": 1,	// # of nodes conquered
            "end": false		// if this turn ends the game
        },
        "2": {...},	// game turn #2 and fields
        ...
        "101": {...},	// last turn, shall see "end": true if not a tie
        "first_player": "p1",	// first player of this game
        "AI1": [	// the personality for AI1
            "Survival",		// trait for threat-perception, or metric
            "agressive",	// trait for enumerating the priority list 
            "cautious",		// trait for reinforcing/placing armies
            "rusher"		// trait for attacking
        ],
        "AI2": [
            "Survival",
            "agressive",
            "cautious",
            "rusher"
        ],
        "winner": "p1"	// the winner of this game, "tie" if none
    },
    "2": {...},		// game #2
    ...
    "100": {...}	// game #100
}
-->

<!-- So you can get the data by specifying the address, say at `['1', '1', 'p1', 'n_countries']` would be the value `14`. -->

<!-- If Mathematica's JSON parsing/data transformation is too hard, you may try out a simple data extractor `analysis.js` in the data file. The code runs on node JS, which you'd have to install (it's easy). If so you have to download this entire project. Instruction below. -->


#### Node.js

If you don't have `Node.js`, go to their website [Nodejs](https://nodejs.org) and install it (You may need to restart). To check your Node version, type into terminal

```bash
node -v
```


#### How to run it yourself
1). Have a desired project directory. e.g. mine is `/Users/kengz/Work`. Open your terminal; to navigate to that directory, type `cd ~/Work`.

**Tip:** You can auto-complete directory in terminal by typing `~/`, the first letter, then pressing the `tab` key.

2). At this Github page, copy the link at the `HTTPS clone URL`. (If you don't have `git`, simply download the zip file.)

3). Go back to your terminal, type `git clone` then paste the url, like:

```bash
git clone https://github.com/kengz/Risk-game.git
```

4). Hit enter and let it install.

5). Go into the builder directory by typing 

```bash
cd ~/Work/Risk-game
```

6). Install the dependencies by typing 

```bash
npm install
```

7). The main file with parameter is `main.js`, modify as you like. To run it:

```bash
node main.js
```

You should see the output messages and built file.


