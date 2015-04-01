// dependencies
var _ = require('underscore');
var fs = require('fs');

function Card(countryIndex, picture) {
	this.name = countryIndex;
	this.picture = picture;
}

// create the deck and save
var clist = _.range(42);
var deck = {};
_.each(clist, function(i) {
	deck[i] = new Card(i, i%3);
});

// add wild card. Note deck is used only midst game, not during initmap, so don't worry about the additional wild cards
deck[42] = new Card('wild1', 'wild');
deck[43] = new Card('wild2', 'wild');

// console.log(deck);

// write to deck object output
fs.writeFileSync('./srcdata/deck.json', JSON.stringify(deck, null, 4));