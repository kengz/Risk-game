# Risk-game
Implementation of the 2-player Risk game and the AI to play it, for Math 335 Probability project.


## Strategies
See strategies.md for more. Some rewrite required; coming soon.


## Data Output (Ben, read this)
Download the `data` folder for the `JSON` files and data-transformer. There's a smaller test file titled `GS_test_1_1_1.json` for your experimentation.

Each `GS` (game series) is the result of 100 games played on the same configuration, specified by the number trailing the file name. e.g. `GS_2_10_1` would be for AI1 with personality 2, AI2 with personality 10, and the player order is player-1 first.

Start from the controls, which are `GS_1_1_1.json` and `GS_1_1_2.json`.


#### The data structure of `GS`

Each `GS` is an object, i.e. data wrapped within a pair of braces `{}`, within it is more nested objects. Object is a collection of key-value map, with syntax `key: value`.

We now interpret the data object `GS` from the outermost layer:


```js
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

```

So you can get the data by specifying the address, say at `['1', '1', 'p1', 'n_countries']` would be the value `14`.

If Mathematica's JSON parsing/data transformation is too hard, you may try out a simply data extractor `analysis.js` in the data file. The code runs on node JS, which you'd have to install (it's easy). If so you have to download this entire project. Instruction below.


#### Node.js

If you don't have `Node.js`, go to their website [Nodejs](https://nodejs.org) and install it (You may need to restart). To check your Node version, type into terminal

```bash
node -v
```


#### This Code
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

7). Go into the data folder and try running it by typing

```bash
cd data
node analysis.js
```

You should see the output messages and built file.


