// The main class that runs arena multiple times and export for analysis

// dependencies
var cmb = require('js-combinatorics').Combinatorics;
var _ = require('underscore');

var traitsMap = require('./srcdata/AI-traits.json');
var traitsKey = _.initial(_.keys(traitsMap));

console.log(traitsKey);
cp = cmb.cartesianProduct([0, 1, 2], [0, 10, 20], [0, 100, 200]);
console.log(cp.toArray());