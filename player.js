// The Player class

// dependencies
var _ = require('underscore');


function Player(name) {
	this.name = name;
	// 40, 14 goes into rand assigned countries
	this.armyreserve = 40-14;
	// start game without cards
	this.cards = [];
	// countries owned (indices 0-42)
	this.countries = [];
	// continents owned entirely
	this.continents = [];
	// compute the regions owned, i.e. connected subgraphs
	this.regions;
	this.borders;
	this.attackable;
	// its pressures in the last turn
	this.prevPressures;
	this.currentPressures;
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