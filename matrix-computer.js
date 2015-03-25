// This class provides:
// 0. Useful functions to produce unique matrix
// 1. Compute the Radius-Matrices (RM) static to worldmap and exports
// 2. Compute the Army-Matrices (AM) dynamic to each game turn


// Dependencies
var fs = require('fs');
var _ = require('underscore');
var g =  require('./mapmaker.js').g;

// Setup:
// the list 0-41, representing countries
var clist = _.range(42);
// Init matrix, set level
var mat = [];
// var level = 5;
// add country 0 to checked
var checked = [0];
// new matrix for expanding mat
var newmat = [];


// Helper method: Produce new set of unique arrays from old
function uniqMat(old) {
	// open up fresh outputs
	var fresh = [];
	_.each(old, function(o) {
		var ouniq = true;
		// check if old is present in fresh
		_.each(fresh, function(f) {
			if (same(o, f)) ouniq = false;
		})
		// if not, add to fresh
		if (ouniq) {
			fresh.push(o);
		};
	})
	return fresh;
}
// Helper: determine if two arrays are the same
var same = function(ar1, ar2) {
	var same = true;
	for (var i = 0; i < ar1.length; i++) {
		if (ar1[i] != ar2[i]) same = false;
	};
	return same;
}


/////////////////////
// Radius Matrix:  //
/////////////////////
///static; depends only on map

// Matrix helper recursive function:
// Scan for countries in next radius for "level" times
function nextRadius(level) {
	// take each row in mat	
	_.each(mat, function(row) {
		// the last element in row
		var last = _.last(row);
		// if is a valid country index
		if (last!= -1) {
			// for its adj countries
			_.each(g.nodes[last].adjList, function(adj) {
				// copy row
				var newrow = _.without(row, null);
				// if neighbor is not in checked, i.e. next radius, add
				if (!_.contains(checked, adj)) {
					newrow.push(adj);
				}
				// or else push -1 for "no country"
				else {
					newrow.push(-1);
				}
				// push new row to newmat
				newmat.push( newrow );

			})
		}
		// if last country is invalid, carry over by appending -1
		else {
			var newrow = _.without(row, null);
			newrow.push(-1);
			newmat.push( newrow );
		}
	}) 
	// done with every row

	// reset mat as the expanded version (no duplicate rows); reset mat
	mat = uniqMat(newmat);
	newmat = [];
	// update checked countries
	checked = _.union(checked, _.flatten(mat));
	// decrement level
	level--;
	// recurse
	if (level > 1) {
		nextRadius(level);
	}

	// finally, when done, return mat
	return mat;
}

// Compute a Radius Matrix. Calls the nextRadius method.
function computeRM(i) {
	// init checked
	checked = [i];
	// init mat with first radius
	mat = []; newmat = [];
	_.each(g.nodes[0].adjList, function(adj) {
		mat.push([adj]);
	})
	// update checked
	checked = _.union(checked, _.flatten(mat));

	// call the recursive nextRadius method
	return nextRadius(5);
}



// The primary function to compute all the Radius Matrices. 
function computeRMs() {
	console.log("computing RMs in matrix-computer.js");
	// the All-Radius Matrices object, i.e. radius matrices for all countries
	var RMs = {};
	_.each(clist, function(i) {
		var mat = computeRM(i);
		RMs[i] = mat;
	});
	// save to output
	fs.writeFileSync("./data/radius-matrices.json", JSON.stringify(RMs, null, 4));
	return RMs;
}

computeRMs();
// import the radius matrices for computeAMs
// var RMs = require('./data/radius-matrices.json');
// console.log(RMs);

var RMs;
/////////////////
// Army Matrix //
/////////////////
///Dynamic: depends on each turn 'g', country's owner, current army
///Might wanna migrate this back into graph.js tho. Faster

// Compute a army matrix for a country, from a player's standpoint
function computeAM(country, player) {
	// a radius matrix, copied
	var AM = [];
	var RM = RMs[country];
	_.each(RM, function(row) {
		var AMrow = [];
		_.each(row, function(country) {
			// if country invalid, push 0 army
			if (country == -1) { AMrow.push(0) }
			// else push army number, -ve if is enemy
		else {
			// dynamic dependency on g here
			var c = g.nodes[country];
			var army = c.army;
			if (c.owner != player) {
				army *= -1;
			}
			AMrow.push(army);
		}
	});
		// end of a row, push AMrow to AM
		AM.push(AMrow);
	})
	return AM;
}



// The primary function to compute all the Army Matrices. 
function computeAMs() {
	// Import RMs for computing AMs
	RMs = require('./data/radius-matrices.json');
	// The All Army-Matrices object. Is dynamic of graph g and game turn.
	var AMs = {};
	_.each(clist, function(i) {
		var mat = computeAM(i);
		AMs[i] = mat;
	});
	return AMs;
}


// Export modules
exports.uniqMat = uniqMat;
exports.computeRMs = computeRMs;
exports.computeAMs = computeAMs;