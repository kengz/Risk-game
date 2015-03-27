// The class that parses a map into a graph,
// init map by randomly assigning to players
// Then export the graph, continent, playerlist, player object, clist, cards

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

///////////////////////
// MARKED FOR EXPORT //
///////////////////////

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
		g.nodes[src].addEdge(tar);
		g.nodes[tar].addEdge(src);
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

// call of primary function. Init map and assign countries randomly to plyr
initMap();

// export module: for computing static RM, and for dynamic game-play
exports.g = g;




/////////////////////////////
// Army Matrix computation //
/////////////////////////////

// 'partition' of matrix here = partition by chunk: all has the same first entry
var RMpart = require('./srcdata/RM-partition.json');
// import the functions module
var f = require('./functions.js').fn;

// Import from matrix computer
var matcomp = require('./matrix-computer.js');
// the function to create Node-Matrices and Army-Matrices from g here
var RMstoNMs = matcomp.RMstoNMs;
var NMstoAMs = matcomp.NMstoAMs;

// The dynamic Node Matrices, made from NM with initialized g.
// Called just once per game
var NMs = RMstoNMs(g);

// The dynamic Army Matrices from NMs. Called at every turn when armies shift
var AMs = NMstoAMs('p1', NMs);


// Helper: Apply the candidate weight function wf to army numbers in every row,
// then partition AMs[i]
function wfpAM(i, wf) {
	var AMpart = [];

	// the partition structure
	var guide = RMpart[i];
	var leap = 0;
	_.each(guide, function(step) {
		// for each partition(chunk) consisting of step rows
		var chunk = [];
		// grab the corresponding rows in AM, compute
		for (var r = leap; r < leap+step; r++) {
			// console.log(r);
			// for AMs[i], row r; dot the army with the metric using weight wf
			chunk.push( f.vecdot( AMs[i][r], f.metric(wf) ) );
		}
		// reset index for next chunk
		leap += step;
		// push computed chunk
		AMpart.push(chunk);
	})
	// return the AM, transformed and partitioned
	return AMpart;
}


// The degree of the partitions of RM. Its structure is the same as partAM
var partdegs = require('./srcdata/RM-partdegree.json');
var RMs = require('./srcdata/radius-matrices.json');

// var nodesdeg = _.map(g.nodes, function(n) {
// 	return n.adjList.length;
// });


// Helper: dot sum: AM into vector of chunk-scalar. return 42 vectors
function dotAMsPart(wf) {
	// for every of the 42 countries
	return _.map(clist, function(i) {
		// scalarize partitions by degrees, i.e. take average of column vector in a partition, multiply with the degree of the partition's country
		return f.scalPartByDeg( wfpAM(i, wf) , partdegs[i] );
	});
}

// Primary: per-turn, update AMs, re-dot for player.
// i.e. army = +ve if owned by player, -ve if enermy, 0 if invalid.
function redotAMs(player, wf) {
	// update AMs
	AMs = NMstoAMs(player, NMs);
	// dot it as wanted
	return dotAMsPart(wf);
}

// reduce each row in matrix into its mean
function fullyscalarize(mat) {
	return _.map(mat, f.mean);
}

// console.log(fullyscalarize(dotAMsPart('Gauss')));

// console.log(dotAMsPart('Gauss'));

// console.log(redotAMs('p1', 'Gauss'));

console.log("John");

var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
	// initMap();
	// wfpAM(0, f.Gauss);
	// dotAMs(f.Gauss);
	// f.Gauss(pos);
	redotAMs('p1', 'Gauss');
}
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);
// console.log(g);
