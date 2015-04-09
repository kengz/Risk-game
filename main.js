// The main class that runs arena multiple times and export for analysis

// dependencies
var cmb = require('js-combinatorics').Combinatorics;
var _ = require('underscore');


var ps = require('./srcdata/AI-personalities.json');
// console.log(ps);
var pt = ps[1];


var master = require('./arena.js').masterInit;
master(pt, pt, 1);

// code master to return objects of data
// want: time series of players:
// time, whose turn
// of both AIs,
// countries owned
// continents owned
// pressures (invert perspective) at turn's beginning (after previous move)
// regions
// armies given from dealer
// armies owned on board
// # of attacks per turn and,
// per attack, # of victories, i.e. outcome vec
// # of countries conquered

// Time when game ends, or if is tie?
// winner