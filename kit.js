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

/////////////////////
// Battle object:  //
/////////////////////
// one exists throughout the game
// has a dice, and roll method that takes in number of red/white dice, then gives battle outcome: i.e. from highest pairs, red wins/loses
// function battle() {
//     this.d = new Dice();
//     this.roll = roll;

//     function roll(r, w) {
//         // red = attacker; white = defender
//         var red = _.sortBy(this.d.rollk(r), this.d.bigFirst);
//         var white = _.sortBy(this.d.rollk(w), this.d.bigFirst);
//         // fill rest of white w/ 0 for ease
//         for (var i = 0; i < r - w; i++) {
//             white.push(0);
//         };
//         // the outcome vector, entry +ve = red win, 0 = tie, -ve = white win
//         var outcome = [];
//         for (var i = 0; i < red.length; i++) {
//             outcome.push(red[i] - white[i]);
//         };
//         return outcome;
//     }

// }


exports.Dice = Dice;

// var bar = new battle();
// console.log(bar.roll(3, 2));
