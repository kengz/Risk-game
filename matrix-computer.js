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
var checked = [];
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
	_.each(g.nodes[i].adjList, function(adj) {
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
	fs.writeFileSync("./srcdata/radius-matrices.json", JSON.stringify(RMs, null, 4));
	return RMs;
}

// computeRMs();


// import the radius matrices for use below
var RMs = require('./srcdata/radius-matrices.json');



//////////////////
// RM partition //
//////////////////
///This is directly dependent of the RM generated

// partition RMs[i] by the first entry of RMrow.
// returns array whose entry = number of rows with same first node,
// array.length = the degree of country i
function partRM(i) {
	// Init part and prevhead term
	var part = [0];
	var prevhead = RMs[i][0][0];
	_.each(RMs[i], function(row) {
		// if row diff from previous head term, push new counter = 1
		if (row[0] != prevhead) {
			part.push(1);
		}
		else {
			// else increment this counter by 1
			part.push(part.pop()+1);
		}
		// update prevhead for next turn
		prevhead = row[0];
	})
	return part;
}
// Primary function: partition all RMs
function partRMs() {
	RMpart = {};
	_.each(clist, function(i) {
		RMpart[i] = partRM(i);
	})
	// save to output
	fs.writeFileSync("./srcdata/RM-partition.json", JSON.stringify(RMpart, null, 4));
	return RMpart;
}

// partRMs();



/////////////////
// Node-Matrix //
/////////////////
///With dynamic graph dg passed as param

// Convert static RM to Node-Matrix, for a country, from dynamic graph dg
function RMtoNM(country, dg) {
	// a radius matrix, copied
	var NM = [];
	var RM = RMs[country];
	_.each(RM, function(row) {
		var NMrow = [];
		_.each(row, function(country) {
			// dynamic dependency on g here
			// push whole node to use pointer: (object by reference)
			// entry is undefined if invalid index -1
			// forces can be transformed into +- by node.owner
			NMrow.push( { node: dg.nodes[country] } );
		});
		// end of a row, push NMrow to NM
		NM.push(NMrow);
	})
	return NM;
}

// Convert static all RMs to Node-Matrices, from input dynamic graph dg
function RMstoNMs(dg) {
	// The All Army-Matrices object. Is dynamic of graph g and game turn.
	var NMs = {};
	_.each(clist, function(i) {
		var mat = RMtoNM(i, dg);
		NMs[i] = mat;
	});
	return NMs;
}


/////////////////
// Army Matrix //
/////////////////
///With external Node-matrix passed as param.

// convert One NM to val, +- according to player == owner
function NMtoAM(i, player, NMs) {
	var AM = [];
	_.each(NMs[i], function(row) {
		var AMrow = [];
		_.each(row, function(ptr) {
			// if country invalid, push 0
			if (ptr.node == undefined)
				AMrow.push(0);
			else
			{
				// if country owned by player, push positive
				if (ptr.node.owner == player)
					AMrow.push(ptr.node.army);	
				// else push negative army number
				else 
					AMrow.push(-1 * ptr.node.army);	
			}
		})
		// end of row, push row to AM
		AM.push(AMrow);
	})
	return AM;
}

// The primary function to convert Node matrices to Army Matrices. 
function NMstoAMs(player, NMs) {
	// The All Army-Matrices object. Is dynamic of graph g and game turn.
	var AMs = {};
	_.each(clist, function(i) {
		var mat = NMtoAM(i, player, NMs);
		AMs[i] = mat;
	});
	return AMs;
}


// Export modules
exports.uniqMat = uniqMat;

exports.computeRMs = computeRMs;
exports.RMstoNMs = RMstoNMs;
exports.NMstoAMs = NMstoAMs;