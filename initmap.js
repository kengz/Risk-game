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

// the graph = map
var g = new JSGraph();
// the list 0-41, representing countries
var clist = _.range(42);


// write from rawCont to a JSON continent object
function writeContinentObject() {
	// the continents: key-array map
	var cont = {};
	// add to continents
	_.each(rawCont, function(line) {
		line = line.split(" ");
		var con = line[0], country = line[1];
		// add country(index) to each continent
		cont[line[0]] = _.union(cont[line[0]], [parseInt(line[1])]);
	});
	fs.writeFileSync('./srcdata/continents.json', JSON.stringify(cont, null, 4));
}
// writeContinentObject();

// Make the graph/map
function makeG() {
	// enum the index - continent map
	var conti = {};
	_.map(rawCont, function(c) {
		var s = c.split(" ");
		conti[s[1]] = s[0];
	})
	// there's 42 countries indexed  0-41; access by g.nodes[i]
	_.each(clist, function(country) {
		g.addNode(country, conti[country]);
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

}



// the player countries
var p1c, p2c, p3c;
// init new player objects
var Player = require('./player.js').Player;
var p1 = new Player('p1'), p2 = new Player('p2'), p3 = new Player('p3');
// bench = collection of player objects
var bench = [p1, p2, p3];

// assign countries to player randomly
function assignCountries() {
	// shuffle the clist
	// var sl = _.shuffle(clist);
	
	//////////////////////////////////
	// testing control: no shuffle //
	//////////////////////////////////
	
	var sl = [ 40,6,3,30,38,31,25,29,35,21,5,41,34,10,37,22,26,13,12,20,15,4,19,0,9,36,23,39,8,27,32,18,11,14,17,24,16,7,2,1,33,28 ];
	// slice it to 3 parts for 2 players, 1 neutral
	p1c = sl.slice(0, 14); p2c = sl.slice(14, 2*14); p3c = sl.slice(2*14);
	// console.log(p1c, p2c, p3c);
	// Then set the nodes in graph to identify its owner, place 1 army
	_.each(p1c, function(i) { g.nodes[i].owner = "p1"; g.nodes[i].army++; })
	_.each(p2c, function(i) { g.nodes[i].owner = "p2"; g.nodes[i].army++; })
	_.each(p3c, function(i) { g.nodes[i].owner = "p3"; g.nodes[i].army++; })

	// init player objects with countries
	p1.initCountries(p1c);
	p2.initCountries(p2c);
	p3.initCountries(p3c);
}

// Primary function to initialize map: 
// make graph, random assign countries to players
function initMap() {
	makeG();
	assignCountries();
	console.log("Making graph from map, randomly assign countries to players.");
	// return graph g, bench = list of new players
	return {
		g: g,
		bench: bench,
	};
}

// call of primary function. Init map and assign countries randomly to plyr
// initMap();
// exports.g = g;

// Export to arena to call
exports.initMap = initMap;

