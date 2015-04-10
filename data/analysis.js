// dependencies
var _ = require('underscore');
var fs = require('fs');

var GS = require('./GS_test_1_1_1.json');


// DONT MODIFY: extract value from its address, which is an array specifying how deep in GS it is
function extract(address) {
	var value = GS;
	// dive further into GS
	function dive(key) {
		return value[key];
	};
	// keep diving as necessary
	for (var i = 0; i < address.length; i++) {
		value = dive(address[i]);
	};
	// finally, return value at arrived destination
	return value;
}

// The game # we are extracting from
var game_n;
// The address function, with variable i.
// MODIFY: the returned array as needed
function address(i) {
	// the address to specift the target data
	return [game_n ,i , 'p1', 'n_countries'];
} 
// DONT MODIFY: the result returned from extracting at address
function result(i) {
	return extract(address(i));
}

// DONT MODIFY: Pre-main method
// return the target data array from game #j
function pull(j) {
	// set the game_number
	game_n = j;
	// the number of turns in a game = game.length - 4
	var n_turn = _.keys(GS[game_n]).length - 4;
	return _.map(_.range(1, n_turn+1), result);
}


/////////////////
// Main method //
/////////////////

// DONT MODIFY: Main method. Pull the result from game #j into an array
// Returns an array of output from pull(j) for all game #j played
function pullAll() {
	// total number of games played
	var num_game = _.keys(GS).length;
	return _.map(_.range(1, num_game+1), pull)
}

// call and print the output to terminal
console.log(pullAll());
// or write the file to output
// MODIFY the file name 'extracted.json'
fs.writeFileSync('./extracted.json', JSON.stringify(pullAll(), null, 4));




