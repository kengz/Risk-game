// The kits of the game:
// cards, dice

// dependencies
var _ = require('underscore');
var fs = require('fs');


//////////
// Card //
//////////
function Card(countryIndex, picture) {
    this.name = countryIndex;
    this.picture = picture;
};
// Make a deck for 2 players = 42 countries + 2 wild. Saved to Json
function makeDeck() {
    // create the deck and save
    var clist = _.range(42);
    var deck = {};
    _.each(clist, function(i) {
        deck[i] = new Card(i, i % 3);
    });

    // add wild card. Note deck is used only midst game, not during initmap, so don't worry about the additional wild cards
    deck[42] = new Card('wild1', 'wild');
    deck[43] = new Card('wild2', 'wild');

    // console.log(deck);

    // write to deck object output
    fs.writeFileSync('./srcdata/deck.json', JSON.stringify(deck, null, 4));
};
// makeDeck();

// need a deck object, to deal cards, and when empty, refresh


//////////
// Dice //
//////////
function Dice() {
    this.roll = roll;
    this.rollk = rollk;
    this.bigFirst = bigFirst;
    // roll once
    function roll() {
        return _.random(1, 6);
    };
    // roll k times in a row
    function rollk(k) {
        var arr = [];
        for (var i = 0; i < k; i++) {
            arr.push(roll());
        }
        return arr;
    };
    // sort from large value
    function bigFirst(val) {
        return -val;
    };
}

exports.Dice = Dice;

// var bar = new battle();
// console.log(bar.roll(3, 2));
