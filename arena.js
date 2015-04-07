// Arena: The place for all gamesteps and computations.
// All dynamic objects exist in here, and interact here, to maximize speed. All other classes need to exchange dynamic object through here.


// dependencies
var _ = require('underscore');


// primary dynamic objects:
var g; //graph (the board/map)
var bench, p1, p2, p3; // bench = players



////////////////////////////////
// Initialize map and players //
////////////////////////////////

var control = true; //control test: don't randomize
var init = require('./initmap.js').initMap(control);
// create graph g.
g = init.g;
exports.g = g;
// create all players
bench = init.bench;
p1 = bench[0];
p2 = bench[1];
p3 = bench[2];

// after init, return all 42 country cards + 2 wild, shuffle
// var deck = require('./srcdata/deck.json');
// var shuffle = _.shuffle(_.range(42 + 2));



/////////////////////////////////////
// Reinforce-attack call sequence: //
/////////////////////////////////////
// 1. update worths and pressures for nodes (between enemy turns to detect changes)
// 2. enumPriority w/ AI personality(permutation)
// 3. Reinforce based on priority lists and origin-map
// 4. attack by list


// Import from priority algorithm, construct PA
var PrioAlg = require('./priority-alg.js');
var PA = new PrioAlg.PA(g, bench);

// AI updating its info before moves
function AIupdate(AI) {
    // use AI's(brain of) player object
    PA.updateForPriority(p1, 'Gauss');
    var attOrgMap = PA.mapAttOrigins(p1);
    // use AI personality: permutation
    PA.enumPriority(p1, [0, 1, 2, 3], 3);
};
// AIupdate();
console.log(p1);

// dealer = rule controller
function controller() {
    this.getArmies = getArmies;
    // sets of cards traded in so far
    var setTraded = 0;
    var deck = require('./srcdata/deck.json');

    var contWorth = require('./srcdata/continent-army-worth.json');


    ////////////////
    // Deal cards //
    ////////////////



    /////////////////
    // Give armies //
    /////////////////
    // AI calls to get armies:
    // param: player object; sets of cards to trade in
    function getArmies(player, setsofCards) {
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
        // 1. put into node +2 for each card name in player countries
        _.each(cardset, function(c) {
            if (_.contains(player.countries, c.name)) {
                g.nodes[c.name].army += 2;
            };
        });
        // 2. give the num of armies from cardset
        var cardArmy = armyFromCardSet(setTraded);
        // update total set traded
        setTraded++;
        return cardArmy;
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


// AI will call dealer method with its cards to trade in


// move out to arena, external rule imposer


var AIC = require('./AI-modules.js').AI;
var AI = new AIC(p1);

var co = new controller();
var arm = co.getArmies(AI.player);
console.log(arm);

// console.log(AI);
// console.log(AI.getArmies());




// console.log(deck);
// console.log(p1);


// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
    // AIupdate();
}
var end = new Date().getTime();
var time = end - start;
// console.log(p1);
// console.log(g.nodes[0]);
console.log('Execution time: ' + time);

// console.log(g);
