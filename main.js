// The main class that runs arena multiple times and export for analysis

// dependencies
var cmb = require('js-combinatorics').Combinatorics;
var _ = require('underscore');
var fs = require('fs');

var ps = require('./srcdata/AI-personalities.json');

// The game constructor from arena
var game = require('./arena.js').Game;

// a config
var conf1 = {
	p1: ps[1],
	p2: ps[1],
	first: 'p1'
};

// a config
var conf2 = {
	p1: ps[1],
	p2: ps[1],
	first: 'p2'
};

// repeat games for a fixed config: personalities, player order.
function repeat(n, c) {
	// the game-series
	var GS = {};
	for (var i = 1; i < n+1; i++) {
		// save an instance of a game's time-series TS
		GS[i] = game(c['p1'], c['p2'], c['first']);
	};
	fs.writeFileSync('./data/GS.json', JSON.stringify(GS, null, 0));
	return GS;
}

repeat(3, conf1);


console.log(ps[1]);




////////////////////////////
// Time series TS legend: //
////////////////////////////

// TS data structure:
// TS['first_player']
// TS['AI1'] personality of AI1
// TS['AI2'] personality of AI1
// TS['winner']
// TS[time] = t_data;

// where t_data is a data structure nested within, at 'time':
// t_data['turn'] whose turn is it
// t_data['n_attacks'] number of attacks
// t_data['all_outcomes'] outcomes to all n_attacks, is an array where length = number of actual engagements, i.e. # of dice rolls by defender
// entry value: -1: attacker loses an army; 0:tie, 1:defender loses an army
// t_data['n_conquered'] number of countries conquered in this turn
// t_data['end'] whether the game ends at this turn

// t_data['p1'] player one's data at this turn
// t_data['p2'] player two's data at this turn
// where player's data structure p is
// p['n_countries'] number of countries owned
// p['n_continents'] number of continents owned
// p['countries'] indices of countries owned
// p['continents'] indices of continents owned
// p['regions'] regions (connected subgraph) owned
// p['pressures'] the pressures of all 42 countries (indexed) from player's perspective
// p['n_army_given'] the number of armies given to player from dealer this turn
// p['n_total_army'] the number of total armies player owns on the board

// time, whose turn
// of both AIs,
// create players:
// countries owned
// continents owned
// regions
// pressures (invert perspective) at turn's beginning (after previous move)
// armies given from dealer
// armies owned on board

// # of attacks per turn and,
// per attack, # of victories, i.e. outcome vec
// # of countries conquered

// Time when game ends, or if is tie?
// winner
// player order
// personalities
