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

// Primary: per-turn:
function updatePressures(player, wf) {
    // update AMs
    var AMs = NMstoAMs(player, NMs);
    // recalc pressure for player. you = +ve
    return calcPressure(wf, AMs);
}

console.log(p1)

// per turn update player's pressures, regions


///////////////////////
// Region enumerator //
///////////////////////

// console.log(p1);
// console.log(g.nodes[0]);

// method to get the current regions of player
var ghelper = require('./graph.js').helper;
// pass graph g for dynamicism
var gh = new ghelper(g);
// the gh functions: {regions, dist, shape}


var meh = gh.regions(p1);
console.log(meh);


var r1 = meh[1];

var moo = gh.shape(r1);
console.log(moo);



// Prepare for Priority sub-algorithms,
// export as modules


// var d = gh.dist(3, 3);
// var d2 = gh.dist(3, 5);
// var d3 = gh.dist(3, 13);
// var d4 = gh.dist(3, 15);
// console.log("distance", d);
// console.log("distance", d2);
// console.log("distance", d3);
// console.log("distance", d4);


var test = gh.borders(p1);
console.log(test);





// console.log(deck);
// console.log(p1);



// the continents object
var cont = require('./srcdata/continents.json');




// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
	// gh.dist(3,15);
	gh.regions(p1);
    // var boo = updatePressures('p1', 'Gauss');
    // console.log(boo.length);
}
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);
// console.log(g);
