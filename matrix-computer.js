// This class provides:
// 0. Useful functions to produce unique matrix
// 1. Compute the Radius-Matrices (RM) static to worldmap and exports
// 2. Compute the Army-Matrices (AM) dynamic to each game turn


// Dependencies
var fs = require('fs');
var _ = require('underscore');
// var g =  require('./initmap.js').g;
// var g =  require('./arena.js').g;

///////////////////////////////////////
// Helper fields for functions below //
///////////////////////////////////////

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
var alldegs = [];
// The partition degrees: i.e. degree of the chunk's head node
var partdeg;
function partRM(i) {
	partdeg = [];
	// Init part and prevhead term
	var part = [0];
	var prevhead = RMs[i][0][0];
	_.each(RMs[i], function(row) {
		// if row diff from previous head term, push new counter = 1
		if (row[0] != prevhead) {
			part.push(1);
			// push deg
			partdeg.push(g.nodes[prevhead].adjList.length);
		}
		else {
			// else increment this counter by 1
			part.push(part.pop()+1);
		}
		// update prevhead for next turn
		prevhead = row[0];
	})
	// push deg of final chunk
	partdeg.push(g.nodes[prevhead].adjList.length);
	alldegs.push(partdeg);
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
	fs.writeFileSync("./srcdata/RM-partdegree.json", JSON.stringify(alldegs, null, 4));
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







/////////////////////////
// Pressure calculator //
/////////////////////////


// 'partition' of matrix here = partition by chunk: all has the same first entry
var RMpart = require('./srcdata/RM-partition.json');
// import the functions module
var f = require('./functions.js').fn;
// g gotten from above

// Import from matrix computer
// var matcomp = require('./matrix-computer.js');
// the function to create Node-Matrices and Army-Matrices from g here
// var RMstoNMs = matcomp.RMstoNMs;
// var NMstoAMs = matcomp.NMstoAMs;

// DYNAMIC: All DYM moved into arena
// The dynamic Node Matrices, made from NM with initialized g.
// Called just once per game, then this g object is refered to by descendants
// var NMs = RMstoNMs(g);

// DYNAMIC
// The dynamic Army Matrices from NMs. Called at every turn when armies shift
// var AMs = NMstoAMs('p1', NMs);


// Helper: Apply the candidate weight function wf to army numbers in every row,
// then partition AMs[i]
function wfpAM(i, wf, AMs) {
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


// Helper: calculate the pressure: Turn AM into wfpAM, then reduce it to chunks-scalars, then dot with chunk-degree for final pressure
function calcPressure(wf, AMs) {
	// for every of the 42 countries
	return _.map(clist, function(i) {
		// eval the pressure for each AM
		// return wfpAM(i, wf, AMs);
		return f.pressureDeg( wfpAM(i, wf, AMs) , partdegs[i] );
	});
}



// DYNAMIC
// Primary: per-turn, update AMs, recalc pressure for player.
// i.e. army = +ve if owned by player, -ve if enermy, 0 if invalid.
function updatePressures(player, wf) {
	// update AMs
	AMs = NMstoAMs(player, NMs);
	// dot it as wanted
	return calcPressure(wf, AMs);
}






// console.log(updatePressures('p1', 'Gauss'));


// var start = new Date().getTime();
// for (i = 0; i < 100; ++i) {
// 	// initMap();
// 	// wfpAM(0, 'Gauss', AMs);
// 	calcPressure('Gauss', AMs);
// 	// dotAMs(f.Gauss);
// 	// f.Gauss(pos);
// 	// var boo = updatePressures('p1', 'Gauss');
// 	// console.log(boo.length);
// }
// var end = new Date().getTime();
// var time = end - start;
// console.log('Execution time: ' + time);
// // console.log(g);



// Export modules
exports.uniqMat = uniqMat;
// exports.computeRMs = computeRMs;
exports.RMstoNMs = RMstoNMs;
exports.NMstoAMs = NMstoAMs;
exports.calcPressure = calcPressure;