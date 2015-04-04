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
// the gh functions: {regions, dist, shape, borders}


// var meh = gh.regions(p1);
// console.log(meh);


// var r1 = meh[1];

// var moo = gh.shape(r1);
// console.log(moo);



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


// var test = gh.borders(p1);
// console.log(test);

// update priority for player p
function updateForPriority() {
	// for each player in bench
	_.each(bench, function(p) {
		p.regions = gh.regions(p);
		p.borders = gh.borders(p);
		p.attackable = gh.attackable(p, p.borders);
		p.shapes = _.map(p.regions, function(r) {
			return gh.shape(p, r);
		})
	})
}


///////////////////////////
// Choosing target nodes //
///////////////////////////

// Don't exclude islands,
// but rank all nodes by order

// Enum for player all the needed things

// eval values for all nodes: yours and enemies'
// by neutral attributes
function evalNode(i, regsize, round) {
	// set node, prevent repeated calling for efficacy
	var node = g.nodes[i];

    // 1. continent-completion: get fraction
    var contFrac = continentFrac(node);

    // 2. region expansion. make big region even bigger? i.e. adj to nodes of a big region
    // the size of region node belongs to
    var regsize = regsize;

    // 3. shape: 
    var roundness = round;

    // if i is in mins or max or none

    // 4. node degree
    this.degree = node.adjList.length;
    
    // 5. retrieve its current pressure from update
    node.pressure;
    
    // call a metric to calc the value from above
    // set node's worth
    // node.worth = 
}

// eval all nodes, groupby, sortby worth

// sortby value all node-group: enemy a batch, yours a batch
// by region

function foo(p) {
	// do by each region
	for (var i = 0; i < p.regions.length; i++) {
		// corresponding shape of region
		var shape = p.shapes[i];
		var region = p.regions[i];

		var regsize = region.length;
		var roundness = shape.roundness;
		var mins = shape.mins;
		var maxs = shape.maxs;
		// call evalNodeworth, with shape and reg size as input
		_.each(region, function(n) {
			_.contains(mins, n);
			evalNode(n);
		})
	};
}

function bar() {
	_.each(bench, function(p) {
		foo(p);
	})
}


// the continents object
var cont = require('./srcdata/continents.json');
console.log(cont);

function continentFrac(node) {
	var allyNum = 0;
	var owner = node.owner;
	var icont = node.continent;
	var contclist = cont[icont];
	_.each(contclist, function(n) {
		if (g.nodes[n].owner == owner) allyNum++;
	})
	return allyNum / contclist.length;
}

console.log(continentFrac(g.nodes[0]));

// console.log(deck);
// console.log(p1);

// console.log(g.nodes[0]);


console.log(p1);
updateForPriority();
console.log(p1);
console.log(p1.shapes[1].mins);

// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
    // gh.dist(3,15);
    // gh.regions(p1);
    updateForPriority();
    // var boo = updatePressures('p1', 'Gauss');
    // console.log(boo.length);
}
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);
// console.log(g);
