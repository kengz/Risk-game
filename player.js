// The Player class

// dependencies
var _ = require('underscore');

// init helper: array of 42 zeroes
var zeroes42 = [];
for (var i = 0; i < 42; i++) {
	zeroes42.push(0);
};

// The player class
function Player(name) {
	this.name = name;
	// 40, 14 goes into rand assigned countries
	this.armyreserve = 40-14;
	// total number of armies
	this.army;
	// start game without cards
	this.cards = [];
	// (previous)countries owned (indices 0-42)
	this.prevCountries;
	this.countries = [];
	// continents owned entirely
	this.continents = ["Asia"];
	// compute the regions owned, i.e. connected subgraphs
	this.regions = [];
	this.shapes = [];
	// inherits the ordering from regions, i.e. attackable from the biggest region
	this.borders = [];
	this.attackable = [];
	// its pressures in the last turn
	this.prevPressures = zeroes42;
	// pressures of all 42 nodes from player's perspective
	this.pressures = zeroes42;
	// worths: self = your nodes, sorted by worth
	// enemies = attackable nodes, sorted by worth
	this.worths = zeroes42;
	// methods
	this.initCountries = initCountries;

	// initialize countries at start of game
	function initCountries(arr) {
		this.countries = arr;
	};

	// check if player has a country
	function hasCountry(index) {
		return _.contains(countries, index);
	};

	// remove the country from the player
	function removeCountry(index) {
		this.countries = _.without(this.countries, index);
	};
	// add a country
	function addCountry(index) {
		this.countries.push(index);
	};


}


exports.Player = Player;