// The function module:
// f(v) that processes an array by term

// Dependencies
var _ = require('underscore');
var m = require('mathjs');


// declare as object for export
var fn = {

	// Helper to apply by function to vector by term: f(v)
	applyByTerm: function(f, v) {
		var res = [];
		_.each(v, function(x) {
			res.push(f(x));
		})
		return res;
	},

	// Renormalize the functions below by weight sum
	renorm: function(v) {
		var sum = m.sum(v);
		function f(x) { return x/sum; }
		return this.applyByTerm(f, v);
	},


	// Exp[-x]
	ExpDecay: function(v) {
		return this.renorm(
			m.exp( m.dotMultiply( v, -1) )
			);
	},
	
	// Exp[-x^2]
	Gauss: function(v) {
		return this.renorm(
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
		return this.renorm(
			this.applyByTerm(f, v)
			);
	},
	
	// 1/(1+Exp[-x])
	Logistic: function(v) {
		var xscale = -2;
		function trans(x) { return xscale*x + 5; }
		function f(x) { return 1/(1+m.exp( -trans(x) )); }
		return this.renorm(
			this.applyByTerm(f, v)
			);
	},
	
	// Logit, = inverse of logistic
	// ln[p/(1-p)], where p is normalized
	Logit: function(v) {
		var xscale = -1/6;
		function trans(x) { return xscale*x + 1; }
		function f(x) { return m.log( trans(x) / (1 - trans(x) ) ) + 6;	 }
		return this.renorm(
			this.applyByTerm(f, v)
			);
	}
	

}

exports.fn = fn;

// var ar = _.range(1,6);
// console.log(ar);
// console.log("renorm", fn.renorm(ar));
// console.log("eDecay", fn.ExpDecay(ar));
// console.log("gauss", fn.Gauss(ar));
// console.log("survival", fn.Survival(ar));
// console.log("logistic", fn.Logistic(ar));
// console.log("logfrac", fn.Logit(ar));