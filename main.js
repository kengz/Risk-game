// The main class that runs arena multiple times and export for analysis

// dependencies
var cmb = require('js-combinatorics').Combinatorics;
var _ = require('underscore');
var fs = require('fs');

var ps = require('./srcdata/AI-personalities.json');
// console.log(ps);
var pt = ps[1];


var master = require('./arena.js').masterInit;
var TS = master(pt, pt, 'p1');
fs.writeFileSync('./srcdata/TS.json', JSON.stringify(TS, null, 4));

// code master to return objects of data
// want: time series of players:

// TS data structure:
// TS['first_player']
// TS['AI1_personality']
// TS['AI2_personality']
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
// p['']

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
