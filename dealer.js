// Dealer, i.e. the controller class that imposes the rules in dealing cards and giving armies

// dependencies
var _ = require('underscore');

var Dice = require('./kit.js').Dice;

// dealer = rule dealer
function dealer(dg) {
    this.transfer;
    this.d = new Dice();
    this.roll = roll;
    this.giveArmies = giveArmies;
    this.getCards = getCards;
    this.dealCard = dealCard;

    var g = dg;
    // sets of cards traded in so far
    var setTraded = 0;
    // armies worth per continent
    var contWorth = require('./srcdata/continent-army-worth.json');

    // the deck of cards & shuffle sequence
    var deck = require('./srcdata/deck.json');
    var shuffle = _.shuffle(_.range(42 + 2));


    ////////////////////////////////
    // Battle roll: red and white //
    ////////////////////////////////
    function roll(r, w) {
        // red = attacker; white = defender
        var red = _.sortBy(this.d.rollk(r), this.d.bigFirst);
        var white = _.sortBy(this.d.rollk(w), this.d.bigFirst);
        // fill rest of white w/ 0 for ease
        for (var i = 0; i < r - w; i++) {
            white.push(0);
        };
        // the outcome binary vector, entry +ve = red win, 0 = tie, -ve = white win
        var outcome = [];
        for (var i = 0; i < red.length; i++) {
            outcome.push(Math.sign(red[i] - white[i]));
        };
        return outcome;
    }

    ////////////////
    // Deal cards //
    ////////////////
    // player earns one card per turn if capture any terr
    function getCards(player) {
        if (player.countries.length - player.prevCountries.length > 0) {
            return dealCard();
        }
    };
    // helper: deal the next card (return card index)
    function dealCard() {
        // if depleted cards, open new deck
        if (shuffle.length == 0) {
            console.log("shuffle new deck!");
            shuffle = _.shuffle(_.range(42 + 2));
        };
        return shuffle.pop();
    };


    /////////////////
    // Give armies //
    /////////////////
    // AI calls to get armies:
    // param: player object; sets of cards to trade in
    function giveArmies(player, setsofCards) {
        var army = 0;
        // 1. count territories / 3 (floor). max of this or 3
        // 2. count continents w/ values (see map)
        // 3. trade in cards, count n-th set, match territory
        army += armyByTerr(player);
        army += armyByCont(player);
        _.each(setsofCards, function(set) {
            army += tradeIn(player, set);
        })
        return army;
    };
    // 1. return army given by territories
    function armyByTerr(player) {
        return _.max([Math.floor(player.countries.length / 3), 3]);
    };
    // 2. return armies by counting continent owned
    function armyByCont(player) {
        var contArmy = 0;
        // armies gotten per continents
        _.each(player.continents, function(c) {
            // failsafe
            if (contWorth[c] != undefined) {
                contArmy += contWorth[c];
            };
        });
        return contArmy;
    };
    // 3. return army by trade in one set of cards. (also set the extra 2 armies in territory owned = card name). Can be called many times.
    function tradeIn(player, cardset) {
        // update total set traded
        setTraded++;
        // 1. put into node +2 for each card name in player countries
        _.each(cardset, function(c) {
            if (_.contains(player.countries, c.name)) {
                g.nodes[c.name].army += 2;
            };
        });
        // 2. give the num of armies from cardset
        return armyFromCardSet(setTraded);
    };
    // helper: Gives the army for i-th set traded in
    function armyFromCardSet(i) {
        if (0 < i && i < 6) {
            return 4 + (i - 1) * 2;
        } else if (5 < i) {
            return (i - 3) * 5;
        } else
        return 0;
    };

}


exports.dealer = dealer;
