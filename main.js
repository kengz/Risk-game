// The main class that runs arena multiple times and export for analysis

// dependencies
var cmb = require('js-combinatorics').Combinatorics;
var _ = require('underscore');
var fs = require('fs');

// For configs
// var ps = require('./srcdata/filtered-AI-personalities.json');
var ps = require('./srcdata/AI-personalities.json');
var pls = ['p0','p1','p2'];

// The game constructor from arena
var game = require('./arena.js').Game;

// The max turn for a game
var max = 300;
// repeat games for a fixed config: personalities, player order.
function repeat(n, c, o) {
	// the game-series
	var GS = {};
	for (var i = 1; i < n+1; i++) {
		// save an instance of a game's time-series TS
		// GS[i] = game(c['p1'], c['p2'], c['first']);
		GS[i] = new game(ps[c[0]], ps[c[1]], pls[c[2]], max);
	};
	// fs.writeFileSync('./data/GS.json', JSON.stringify(GS, null, 0));
	fs.writeFileSync(o, JSON.stringify(GS, null, 0));
	console.log("file written to ", o);
	// delete object from memory to free up space
	GS = null;
	// return GS;
}


var start = new Date().getTime();


// Unfiltered Runs: change ps src file
// repeat(30, [11,0,1], './selectiondata/GS_11_0_1.json');
// repeat(30, [11,1,1], './selectiondata/GS_11_1_1.json');
// repeat(30, [11,2,1], './selectiondata/GS_11_2_1.json');
// repeat(30, [11,3,1], './selectiondata/GS_11_3_1.json');
// repeat(30, [11,4,1], './selectiondata/GS_11_4_1.json');
// repeat(30, [11,5,1], './selectiondata/GS_11_5_1.json');
// repeat(30, [11,6,1], './selectiondata/GS_11_6_1.json');
// repeat(30, [11,7,1], './selectiondata/GS_11_7_1.json');

// repeat(30, [11,8,1], './selectiondata/GS_11_8_1.json');
// repeat(30, [11,9,1], './selectiondata/GS_11_9_1.json');
// repeat(30, [11,10,1], './selectiondata/GS_11_10_1.json');
// repeat(30, [11,11,1], './selectiondata/GS_11_11_1.json');
// repeat(30, [11,12,1], './selectiondata/GS_11_12_1.json');
// repeat(30, [11,13,1], './selectiondata/GS_11_13_1.json');
// repeat(30, [11,14,1], './selectiondata/GS_11_14_1.json');
// repeat(30, [11,15,1], './selectiondata/GS_11_15_1.json');

// repeat(30, [11,0,2], './selectiondata/GS_11_0_2.json');
// repeat(30, [11,1,2], './selectiondata/GS_11_1_2.json');
// repeat(30, [11,2,2], './selectiondata/GS_11_2_2.json');
// repeat(30, [11,3,2], './selectiondata/GS_11_3_2.json');
// repeat(30, [11,4,2], './selectiondata/GS_11_4_2.json');
// repeat(30, [11,5,2], './selectiondata/GS_11_5_2.json');
// repeat(30, [11,6,2], './selectiondata/GS_11_6_2.json');
// repeat(30, [11,7,2], './selectiondata/GS_11_7_2.json');

// repeat(30, [11,8,2], './selectiondata/GS_11_8_2.json');
// repeat(30, [11,9,2], './selectiondata/GS_11_9_2.json');
// repeat(30, [11,10,2], './selectiondata/GS_11_10_2.json');
// repeat(30, [11,11,2], './selectiondata/GS_11_11_2.json');
// repeat(30, [11,12,2], './selectiondata/GS_11_12_2.json');
// repeat(30, [11,13,2], './selectiondata/GS_11_13_2.json');
// repeat(30, [11,14,2], './selectiondata/GS_11_14_2.json');
// repeat(30, [11,15,2], './selectiondata/GS_11_15_2.json');



///////////////
// test runs //
///////////////
// repeat(500, [0,0,1], './data/GS_0_0_1.json');
// repeat(500, [0,1,1], './data/GS_0_1_1.json');
// repeat(500, [0,2,1], './data/GS_0_2_1.json');
// repeat(500, [0,3,1], './data/GS_0_3_1.json');
// repeat(500, [0,4,1], './data/GS_0_4_1.json');
// repeat(500, [1,1,1], './data/GS_1_1_1.json');
// repeat(500, [1,2,1], './data/GS_1_2_1.json');
// repeat(500, [1,3,1], './data/GS_1_3_1.json');
// repeat(500, [1,4,1], './data/GS_1_4_1.json');
// repeat(500, [2,2,1], './data/GS_2_2_1.json');
// repeat(500, [2,3,1], './data/GS_2_3_1.json');
// repeat(500, [2,4,1], './data/GS_2_4_1.json');
// repeat(500, [3,3,1], './data/GS_3_3_1.json');
// repeat(500, [3,4,1], './data/GS_3_4_1.json');
// repeat(500, [4,4,1], './data/GS_4_4_1.json');

// repeat(500, [0,0,2], './data/GS_0_0_2.json');
// repeat(500, [0,1,2], './data/GS_0_1_2.json');
// repeat(500, [0,2,2], './data/GS_0_2_2.json');
// repeat(500, [0,3,2], './data/GS_0_3_2.json');
// repeat(500, [0,4,2], './data/GS_0_4_2.json');
// repeat(500, [1,1,2], './data/GS_1_1_2.json');
// repeat(500, [1,2,2], './data/GS_1_2_2.json');
// repeat(500, [1,3,2], './data/GS_1_3_2.json');
// repeat(500, [1,4,2], './data/GS_1_4_2.json');
// repeat(500, [2,2,2], './data/GS_2_2_2.json');
// repeat(500, [2,3,2], './data/GS_2_3_2.json');
// repeat(500, [2,4,2], './data/GS_2_4_2.json');
// repeat(500, [3,3,2], './data/GS_3_3_2.json');
// repeat(500, [3,4,2], './data/GS_3_4_2.json');
// repeat(500, [4,4,2], './data/GS_4_4_2.json');


// array: pers1, pers2, firstplayer
// note: 1,2 are indices for p1, p2 resp
// repeat(3, [1,1,1], './data/GS_test_1_1_1.json');

// repeat(100, [1,1,1], './data/GS_1_1_1.json');
// repeat(100, [1,1,2], './data/GS_1_1_2.json');
// repeat(500, [1,1,1], './data/GS_1_1_1_500.json');
// repeat(500, [1,1,2], './data/GS_1_1_2_500.json');
// 
// repeat(100, [1,2,1], './data/GS_1_2_1.json');
// repeat(100, [1,2,2], './data/GS_1_2_2.json');
// repeat(500, [1,2,1], './data/GS_1_2_1_500.json');
// repeat(500, [1,2,2], './data/GS_1_2_2_500.json');
// 
// repeat(100, [1,10,1], './data/GS_1_10_1.json');
// repeat(100, [1,10,2], './data/GS_1_10_2.json');
// repeat(500, [1,10,1], './data/GS_1_10_1_500.json');
// repeat(500, [1,10,2], './data/GS_1_10_2_500.json');
// 
// repeat(100, [1,13,1], './data/GS_1_13_1.json');
// repeat(100, [1,13,2], './data/GS_1_13_2.json');
// repeat(500, [1,13,1], './data/GS_1_13_1_500.json');
// repeat(500, [1,13,2], './data/GS_1_13_2_500.json');
// 
// repeat(100, [2,10,1], './data/GS_2_10_1.json');
// repeat(100, [2,10,2], './data/GS_2_10_2.json');
// repeat(100, [2,13,1], './data/GS_2_13_1.json');
// repeat(100, [2,13,2], './data/GS_2_13_2.json');
// repeat(100, [10,13,1], './data/GS_10_13_1.json');
// repeat(100, [10,13,2], './data/GS_10_13_2.json');

var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time/1000/60, 'minutes');

// notable: index
// 1, 2, 10, 13
// [1,2]
// [1,10]
// [1,13]
// [2,10]
// [2,13]
// [10,13]

// var TS = game(conf1['p1'], conf1['p2'], conf1['first']);
// fs.writeFileSync('./data/TS.json', JSON.stringify(TS, null, 0));


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
