// The function module:
// f(v) that distributes and apply to an array/matrix
// v = vector, mat = matrix

// Dependencies
var _ = require('underscore');
var m = require('mathjs');

var partdegs = require('./srcdata/RM-partdegree.json');

// declare as object for export
var fn = {

	// Generic functions
	
	// Renormalize the functions below by weight sum
	renorm: function(v) {
		var sum = m.sum(v);
		function f(x) { return x/sum; }
		return _.map(v, f);
	},
	vecdot: function(v1, v2) {
		return m.dotMultiply(v1, v2);
	},
	// sum a vector
	sum: function(v) {
		return m.sum(v);
	},
	// sum the rows in matrix a, return column
	sumrow: function(a) {
		function f(x) { return m.sum(x); }
		return _.map(a, f);
	},
	// return mean of vector
	mean: function(v) {
		return m.mean(v);
	},
	// composition of mean•sumrow, i.e. mean of column vector of chunk
	msr: function(a) {
		return _.compose(fn.mean, fn.sumrow)(a);
	},
	// Scalarize the partitioned AM into a scalar
	// by summing row – taking mean per partition, 
	// then summing all scalars in partitions
	// Yields a scalar for each chunk, then sum them
	scalAM: function(partAM) {
		return m.sum(_.map(partAM, fn.msr));
	},

	// same as above, but linear combo with weight = degree of partition
	scalAMByDeg: function(partAM, partdeg) {
		return m.dot(_.map(partAM, fn.msr), partdeg);
	},

	// Scalarize each partition of AM, by degree of node
	scalPartByDeg: function(AMpart, partdeg) {
		return m.dotMultiply(_.map(AMpart, fn.msr), partdeg);
	},


	// Candidate strategy/ army-weight functions
	
	// Exp[-x]
	ExpDecay: function(v) {
		var parent = this;
		return fn.renorm(
			tmp = m.exp( m.dotMultiply( v, -1) )
			);
	},

	// Exp[-x^2]
	Gauss: function(v) {
		return fn.renorm(
			m.exp( m.dotMultiply( m.dotPow( v , 2), -1))
			);
	},
	
	// if -ve: 1-Exp[x]/2; else Exp[-x]/2
	Survival: function(v) {
		var xscale = 2;
		function trans(x) { return xscale*x - 5; }
		function f(x) {
			if (trans(x) < 0) { return 1 - m.exp(trans(x))/2; }
			else { return m.exp(-trans(x))/2; }
		}
		return fn.renorm(
			_.map(v, f)
			);
	},
	
	// 1/(1+Exp[-x])
	Logistic: function(v) {
		var xscale = -2;
		function trans(x) { return xscale*x + 5; }
		function f(x) { return 1/(1+m.exp( -trans(x) )); }
		return fn.renorm(
			_.map(v, f)
			);
	},
	
	// Logit, = inverse of logistic
	// ln[p/(1-p)], where p is normalized
	Logit: function(v) {
		var xscale = -1/6;
		function trans(x) { return xscale*x + 1; }
		function f(x) { return m.log( trans(x) / (1 - trans(x) ) ) + 6;	 }
		return fn.renorm(
			_.map(v, f)
			);
	}
	

}

exports.fn = fn;

// var ar = _.range(1,6);
// console.log(ar);
// console.log("eDecay", fn.ExpDecay(ar));
// console.log("gauss", fn.Gauss(ar));
// console.log("survival", fn.Survival(ar));
// console.log("logistic", fn.Logistic(ar));
// console.log("logfrac", fn.Logit(ar));