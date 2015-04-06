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



////////////////////
// Worth Computer //
////////////////////

// Import from priority algorithm, construct PA
var PrioAlg = require('./priority-alg.js');
var PA = new PrioAlg.PA(g, bench);

// helper-Primary: per-turn, update worth/pressure
function updateWorths(player) {
    return PA.updateWorths(player);
}
function updatePressures(player, wf) {
    return PA.updatePressures(player, wf);
}
// Primary: update for priority algorithm
function updateForPriority(player, wf) {
    updateWorths(player);
    updatePressures(player, wf);
}

updateForPriority(p1, 'Gauss');
console.log(p1);

// Call by:
// updateWorth, list worths(to defend) and 
// enum list of nodes to reinforce by press(prev)
// reinforce those lists (high press becomes higher)
// update pressure


// for all the lists, simply enum the targets, the attOrgMap will deal with origin
var attOrgMap = PA.mapAttOrigins(p1);
// console.log(attOrgMap);
console.log("roll", PA.priority(p1, [0, 1, 2, 3], 5));


// console.log(deck);
// console.log(p1);


// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
    // updatePressures(p1, 'Gauss');
    // updateWorths(p1);
    // updateForPriority(p1, 'Gauss');
    // enumAttack(p1);
}
var end = new Date().getTime();
var time = end - start;
// console.log(p1);
// console.log(g.nodes[0]);
console.log('Execution time: ' + time);

// console.log(new Array(10).fill(0));
// console.log(g);
