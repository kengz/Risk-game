// Arena: The place where all gamesteps and computations occur.
// All dynamic objects exist in here, and interact here, to maximize speed. All other classes need to exchange dynamic object through here.


// dependencies
var _ = require('underscore');


// primary dynamic objects:
var g; //graph (the board/map)
var NMs; //the Node-matrices from G to calc pressure
var bench, p1, p2, p3; // bench = players



////////////////////////////////
// Initialize map and players //
////////////////////////////////

var control = true;

var init = require('./initmap.js').initMap(control);
// create graph g.
g = init.g;
// create all players
bench = init.bench;
p1 = bench[0];
p2 = bench[1];
p3 = bench[2];

// after init, return all 42 country cards + 2 wild, shuffle
var deck = require('./srcdata/deck.json');
var shuffle = _.shuffle(_.range(42 + 2));





///////////////////////
// Pressure Computer //
///////////////////////
///Locally compute pressure from the dynamic g

// Import from matrix computer
var mcomp = require('./matrix-computer.js');
// to create Node-Matrices and Army-Matrices; calcPressure
var RMstoNMs = mcomp.RMstoNMs;
var NMstoAMs = mcomp.NMstoAMs;
var calcPressure = mcomp.calcPressure;
// DYNAMIC: create Node-Matrices based on this dynamic g
NMs = RMstoNMs(g);

// helper-Primary: per-turn, update pressure
function updatePressures(player, wf) {
    // update AMs
    var AMs = NMstoAMs(player, NMs);
    // update prevPressures
    player.prevPressures = player.pressures;
    // then update current pressures
    player.pressures = calcPressure(wf, AMs);
    // update on nodes for worth-calc
    for (var i = 0; i < player.pressures.length; i++) {
    	g.nodes[i].pressure = player.pressures[i];
    };
    return player.pressures;
}

////////////////////
// Worth Computer //
////////////////////

// Import from AI modules
var WorthM = require('./AI-modules.js').worthMod;
WorthM = new WorthM(g, bench);

// helper-Primary: per-turn, update worth
function updateWorth(player) {
    // update all node worth from player persp
	player.worths = WorthM.updateWorth(player);
	return player.worths;
}

// Primary: update for priority algorithm
function updateForPriority(player, wf) {
    updateWorth(player);
    updatePressures(player, wf);
}


//////////////////////////////////////////////
// enum lists: attack, weaken, threat, lost //
//////////////////////////////////////////////

// Then place, recalc? Nah, just use from prev step.
// per player turn, update AM, done till end of turn


// console.log(deck);
// console.log(p1);


// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
	// updatePressures(p1, 'Gauss');
    // updateWorth(p1);
    updateForPriority(p1, 'Gauss');
}
var end = new Date().getTime();
var time = end - start;
console.log(p1);
console.log(g.nodes[0]);
console.log('Execution time: ' + time);

// console.log(new Array(10).fill(0));
// console.log(g);
