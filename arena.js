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
    // recalc pressure for player. +ve = this player strong
    return calcPressure(wf, AMs);
}




// Region enumerator
console.log(p1);
// console.log(g.nodes[0]);

function regionSplit() {
	// list of my regions
	var myregions = [];
	// my countries
	// var mine = p1.countries;
	var mine = [ 6, 3, 30, 38, 31, 25, 29, 35, 21, 5, 41, 34, 10 ];


	function foo() {
		// add first base to new region
		var newreg = [mine[0]];
		console.log("set newref", newreg);
		// then remove first from nodes
		mine = _.rest(mine);
		console.log("set mine", mine);

		newreg = _.union(newreg, myconnected(newreg[0]));
		// newreg = [40, 38, 31];
		myregions.push(newreg);

		mine = _.difference(mine, newreg);

		console.log(newreg);
		console.log(mine);
	}

	// while (mine.length != 0) {
	// 	foo();
	// }

	foo();
	console.log();
	foo();

	// var region 

	// get my nodes that are connected
	function myconnected(i) {
		// recursive call needs to go forward, not backward
		// get neigh of i
		var adj = g.nodes[i].adjList;
		// adjacent of i that are mine:
		var neighmine = _.intersection(adj, mine);
		// if found any adj nodes that're mine
		if (neighmine.length != 0) {
			// call for each of neighmine
			return _.uniq(
				_.flatten(
					neighmine, 
					_.map(neighmine, myconnected)
					)
				);
		}
		else
			return [];
	}

	// var meh = myconnected(40);
	// console.log(meh);
}

regionSplit();




// console.log(deck);
// console.log(p1);



// the continents object
var cont = require('./srcdata/continents.json');




// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
	// regionSplit();
    // var boo = updatePressures('p1', 'Gauss');
    // console.log(boo.length);
}
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);
// console.log(g);
