// The function module:
// f(v) that distributes and apply to an array/matrix
// v = vector, mat = matrix

// Dependencies
var _ = require('underscore');
var m = require('mathjs');
var fs = require('fs');

// degrees of the partition in RM
var partdegs = require('./srcdata/RM-partdegree.json');
// posititon vector for metric
var pos = _.range(1,6);

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

    // for each partition of AM, reduce to mean-sum-row, then dotMultiply with degree of partition
    scalPartByDeg: function(AMpart, partdeg) {
        return m.dotMultiply(_.map(AMpart, fn.msr), partdeg);
    },



    ////////////////
    // Pressure: //
    ////////////////
    // reduce for each AM the vector of partition scalars into a single weighted average
    // Current candidate is by Degree of partition. Used for all players

    // Scalarize the partitioned AM into a scalar
    // by summing row – taking mean per partition, 
    // then summing all scalars in partitions
    // Yields a scalar for each chunk, then sum them
    pressureNaive: function(AMpart) {
        return m.sum(_.map(AMpart, fn.msr));
    },

    // same as above, but sum the partitions to get a single scalar for AM
    pressureDeg: function(AMpart, partdeg) {
        return m.dot(_.map(AMpart, fn.msr), partdeg);
    },



    //////////////////////////////////
    // Metrics: weight-functions wf //
    //////////////////////////////////
    ///differ by player strategy
    // Candidate strategy/ army-weight functions
    // i.e. Threat-perception
    
    // Exp[-x]
    ExpDecay: function(v) {
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
        function f(x) { return m.log( trans(x) / (1 - trans(x) ) ) + 6;  }
        return fn.renorm(
            _.map(v, f)
            );
    },

    // Constant metric
    Constant: function(v) {
        function f(x) { return 1; }
        return fn.renorm(
            _.map(v, f)
            );
    },

    // Linear (decreasing)
    Linear: function(v) {
        function f(x) { return 6-x; }
        return fn.renorm(
            _.map(v, f)
            );
    },

    // import the metricdata; survives with the fn object
    metricdata: require('./srcdata/metric.json'),

    // return the metric for wf, i.e. wfpos
    metric: function(wf) {
        return fn.metricdata[wf];
    },


    ////////////////////
    // Worth function //
    ////////////////////
    ///all players use the same
    
    // the metric to separate worthiness, each by value of x10. Yields array of powers of 10 for nodeWorth's dot
    // Saved in json for efficient recalling
    Worthiness: function() {
        // for use in dot product in nodeWorth: 10 powers
        var powers = [1];
        for (var i = 0; i < 6; i++) {
            powers.unshift(_.first(powers)*10);
        };
        return powers;
    },

    // Calc the worth of a node: order the criteria, dot with worthiness metric above
    NodeWorth: function(contFrac, regionIndex, attackableIndex, roundness, minmax, degree, pressure) {
        // ordering on criterion to judge node's worth
        // index 0 if offset to ++
        var order = [contFrac, regionIndex+1, attackableIndex+1, roundness, minmax, degree, pressure];
        var worthiness = fn.Worthiness;

        return m.dot(order, fn.metric('Worthiness'));
    }
    

}


exports.fn = fn;

// Precalculate the pos vector transformed with wf
function preCalculate() {
    var metric = {};
    metric.ExpDecay = fn.ExpDecay(pos);
    metric.Gauss = fn.Gauss(pos);
    metric.Survival = fn.Survival(pos);
    metric.Logistic = fn.Logistic(pos);
    metric.Logit = fn.Logit(pos);
    metric.Constant = fn.Constant(pos);
    metric.Linear = fn.Linear(pos);
    metric.Worthiness = fn.Worthiness();
    fs.writeFileSync("./srcdata/metric.json", JSON.stringify(metric, null, 4));
}

// preCalculate();

// var ar = _.range(1,6);
// console.log(ar);
// console.log("eDecay", fn.ExpDecay(pos));
// console.log("gauss", fn.Gauss(ar));
// console.log("survival", fn.Survival(ar));
// console.log("logistic", fn.Logistic(ar));
// console.log("logfrac", fn.Logit(ar));
// console.log("const", fn.Constant(ar));
// console.log("const", fn.Linear(ar));