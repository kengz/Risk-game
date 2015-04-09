var _ = require('underscore');
var TS = require('./srcdata/TS.json');
var fs = require('fs');

console.log(TS['winner']);
console.log(TS['AI2_personality']);

var t = _.range(1,166);
// var p1Series = []

var p1TS = _.map(t, bar1);
var p2TS = _.map(t, bar2);
var con = _.map(t, bar3);
var c1 = _.map(t, bar4);
var c2 = _.map(t, bar5);
var armies = [p1TS, p2TS, con, c1, c2];
fs.writeFileSync('./data/data_army.json', JSON.stringify(armies, null, 4));

function bar1(time) {
	return foo(time, 'p1', 'n_total_army');
}
function bar2(time) {
	return foo(time, 'p2', 'n_total_army');
}
function bar4(time) {
	return foo(time, 'p1', 'n_countries');
}
function bar5(time) {
	return foo(time, 'p2', 'n_countries');
}
function bar3(time) {
	return TS[time]['n_conquered'];
}

function foo(time, player, field) {
	return TS[time][player][field];
}
