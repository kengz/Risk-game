// The class that parses a map into a graph,
// init map by randomly assigning to players

// dependencies
var _ = require('underscore');
var fs = require('fs');
var JSGraph = require('./graph.js').Graph;
// import static map data
var rawMap = fs.readFileSync('./srcdata/world-map.pyg', 'utf8').split("\n");
var rawCont  =  fs.readFileSync('./srcdata/world-continent.txt', 'utf8').split("\n");


/////////////////
// Data fields //
/////////////////

// the graph = map
var g = new JSGraph();
// the continents: key-array map
var cont = {};
// the list 0-41, representing countries
var clist = _.range(42);
// the player countries
var p1c, p2c, p3c;



// Make the graph/map
function makeG() {
	// there's 42 countries indexed  0-41; access by g.nodes[i]
	_.each(clist, function(country) {
		g.addNode(country);
	});
	// add the adjacent edges for all countries in map
	_.each(rawMap, function(line) {
		line = line.split(" ");
		// line is now [src, -, target, dist]
		var src = parseInt(line[0]), tar = parseInt(line[2]);
		// add neigh's key instead of object
		g.nodes[src].addEdge(tar, 1);
		g.nodes[tar].addEdge(src, 1);
		// g.nodes[tar].addEdge(g.nodes[src], 1);
	});
	// add to continents
	_.each(rawCont, function(line) {
		line = line.split(" ");
		var con = line[0], country = line[1];
		// add country(index) to each continent
		cont[line[0]] = _.union(cont[line[0]], [parseInt(line[1])]);
	});
	// console.log(cont);
}

// assign countries to player randomly
function assignCountries() {
	// shuffle the clist
	var sl = _.shuffle(clist);
	// slice it to 3 parts for 2 players, 1 neutral
	p1c = sl.slice(0, 14); p2c = sl.slice(14, 2*14); p3c = sl.slice(2*14);
	// console.log(p1c, p2c, p3c);
	// Then set the nodes in graph to identify its owner, place 1 army
	_.each(p1c, function(i) { g.nodes[i].owner = "p1"; g.nodes[i].army++; })
	_.each(p2c, function(i) { g.nodes[i].owner = "p2"; g.nodes[i].army++; })
	_.each(p3c, function(i) { g.nodes[i].owner = "p3"; g.nodes[i].army++; })
}

// Primary function to initialize map: make graph, random assign countries
function initMap() {
	makeG();
	assignCountries();
}

// call of primary function
initMap();

// export module: for computing static RM, and for dynamic game-play
exports.g = g;



// Import from matrix computer
var matcomp = require('./matrix-computer.js');
// the function to create Node-Matrices and Army-Matrices from g here
var RMstoNMs = matcomp.RMstoNMs;
var NMstoAMs = matcomp.NMstoAMs;
var RMpart = require('./srcdata/RM-partition.json');

var f = require('./functions.js').fn;



// // the static RM from json
// var RMs = require('./srcdata/radius-matrices.json');
// console.log(RMs[1]);


// console.log(RMpart);


function partAM(i) {
	var guide = RMpart[i];
}

var ar = _.range(1,6);
console.log(ar);
console.log("renorm", f.renorm(ar));
console.log("eDecay", f.ExpDecay(ar));
console.log("gauss", f.Gauss(ar));
console.log("survival", f.Survival(ar));
console.log("logistic", f.Logistic(ar));
console.log("logfrac", f.Logit(ar));

// The dynamic Node Matrices
// var NMs = RMstoNMs(g);
// console.log(NMs);
// The dynamic Army Matrices from NMs
// var AMs = NMstoAMs('p1', NMs);
// console.log(AMs[38]);

// g.nodes[39].army = 222;

// AMs = NMstoAMs('p1', NMs);
// console.log(AMs[38]);



// var boo = m.sqrt(4);
// console.log(boo);
// var m1 = [[1,2], [3,4]];
// // var m2=m.pow(m1, 2);
// var m2=m.multiply(m1, 2);
// console.log(m2);