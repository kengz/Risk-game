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

var init = require('./initmap.js').initMap();
// create graph g
g = init.g;
// create all players
bench = init.bench;
p1 = bench[0];
p2 = bench[1];
p3 = bench[2];


// after init, return all 42 country cards + 2 wild, shuffle
var deck = require('./srcdata/deck.json');
var shuffle = _.shuffle(_.range(42+2));
// deal with returned cards later



// Export the initialized dynamic g
// passed to: matrix-computer, 
exports.g = g;




///////////////////////
// Pressure Computer //
///////////////////////

// Import from matrix computer
var mcomp = require('./matrix-computer.js');
// to create Node-Matrices and Army-Matrices; calcPressure
var RMstoNMs = mcomp.RMstoNMs;
var NMstoAMs = mcomp.NMstoAMs;
var calcPressure = mcomp.calcPressure;

// DYNAMIC
// create Node-Matrices based on this dynamic g
NMs = RMstoNMs(g);

// Primary: per-turn:
function updatePressures(player, wf) {
	// update AMs
	var AMs = NMstoAMs(player, NMs);
	// recalc pressure for player. +ve = this player strong
	return calcPressure(wf, AMs);
}



// console.log(updatePressures('p1', 'Gauss'));




// want to compute AM pressure locally

// console.log(deck);
// console.log(p1);



// the continents object
var cont = require('./srcdata/continents.json');




// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
	// initMap();
	// wfpAM(0, f.Gauss);
	// dotAMs(f.Gauss);
	// f.Gauss(pos);
	var boo = updatePressures('p1', 'Gauss');
	// console.log(boo.length);
}
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);
// console.log(g);
