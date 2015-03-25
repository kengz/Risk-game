// The class that parses a map into a graph,
// init map by randomly assigning to players

// dependencies
var _ = require('underscore');
var fs = require('fs');
var JSGraph = require('./graph.js').Graph;
// import static map data
var rawMap = fs.readFileSync('./data/world-map.pyg', 'utf8').split("\n");
var rawCont  =  fs.readFileSync('./data/world-continent.txt', 'utf8').split("\n");


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



// import the radius matrices for computeAMs
// RMs = require('./data/radius-matrices.json');
// console.log(RMs);
// Import AM?
var compAMs = require('./matrix-computer.js').computeAMs;
var meh = compAMs(0, 'p1');
console.log(g);

