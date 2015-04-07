// Arena: The place for all gamesteps and computations.
// All dynamic objects exist in here, and interact here, to maximize speed. All other classes need to exchange dynamic object through here.


// dependencies
var _ = require('underscore');


// primary dynamic objects:
var g; //graph (the board/map)
var bench, p1, p2, p3; // bench = players



////////////////////////////////
// Initialize map and players //
////////////////////////////////

var control = true; //control test: don't randomize
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



/////////////////////////////////////
// Reinforce-attack call sequence: //
/////////////////////////////////////
// 1. update worths and pressures for nodes (between enemy turns to detect changes)
// 2. enumPriority w/ AI personality(permutation)
// 3. Reinforce based on priority lists and origin-map
// 4. attack by list

// Import from priority algorithm, construct PA
var PrioAlg = require('./priority-alg.js');
var PA = new PrioAlg.PA(g, bench);

// AI updating its info before moves
function AIupdate(AI) {
    // use AI's(brain of) player object
    PA.updateForPriority(p1, 'Gauss');
    var attOrgMap = PA.mapAttOrigins(p1);
    // use AI personality: permutation
    PA.enumPriority(p1, [0, 1, 2, 3], 3);
}





// console.log(deck);
// console.log(p1);


// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
    AIupdate();
}
var end = new Date().getTime();
var time = end - start;
// console.log(p1);
// console.log(g.nodes[0]);
console.log('Execution time: ' + time);

// console.log(g);
