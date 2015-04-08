// dependencies
var _ = require('underscore');

// Useful globals
// deck for converting card indices to cards
var deck = require('./srcdata/deck.json');
// combinatorics library
var cmb = require('js-combinatorics').Combinatorics;

// AI = brain of player, will control the player object
// contains the trait
// will make moves and decisions


// Game Stages:
// 1. Priority Algorithm
// 2. Placement Algorithm
// 3. Attack Algorithm


// 1. Priority permutation: id [0,1,2,3] = 
// [enumAttack, enumWeaken, enumThreat, enumLost];
// Personalities:
// attack-then-defend: [0,1,2,3]
// opportunist-attack-then-defend: [1,0,2,3]
// defend-then-attack: [2,3,0,1]
// conservative-defend-then-attack: [3,2,0,1]

// 1. wf: weight function/metric. i.e. Threat-perception. Use only the last 2.
// 2. Sequence of enumerating sublists of priority list. See priority-alg.js. Use only the last 2.
// 3. placement in priority to balance press
// cautious: balance all your pressure > 0 first, then extra for priority
// tactical: place armies in priority first till +4 pressure; if leftover repeat in priority +=4
// 4. pressure threshold to init attack. Also used in keeping cards: rusher = always trade in when can.
// carry: accumulate forces and attack when likely to win

// global for AI, traits(key): variants: values
var traitsMap = require('./srcdata/AI-traits.json');
var traitsKey = _.initial(_.keys(traitsMap));
// console.log(traitsKey);



// AI brain controls the player
function AI(player, persona) {
    // player which has all the fields
    this.player = player;
    // Personality map of AI, e.g. priority: 'agressive'
    this.personality = _.object(traitsKey, persona);
    // get this AI's trait, e.g. priority -> [0,1,2,3]
    this.trait = trait;

    function trait(key) {
        return traitsMap[key][this.personality[key]];
    };

    // The attack-origin map and priority list
    this.attOrgMap = {};
    this.priorityList = [];

    // methods
    this.tradeIn = tradeIn;
    this.getArmies = getArmies;
    this.placeArmies;

    function placeArmies() {

    };

    // get armies from dealer(given). Update player reserve
    function getArmies(given) {
    	this.player.armyreserve += given;
    };

    // AI trade in cards based on personality, to call giveArmies from dealer
    function tradeIn() {
        // extract personality
        var att = this.personality['attack'];

        // the sets of card(indices) to trade in
        var tradeSets = [];

        // Rule: if hand has 5 or more cards, must trade
        if (this.player.cards.length > 4) {
            tradeSets.push(findTradeable(this.player));
        }
        // Personality:
        // if is rusher, always trade in all cards
        if (att == 'rusher') {
            var nextSet = findTradeable(this.player);
            // trade till can't
            while (nextSet != undefined) {
                tradeSets.push(nextSet);
                nextSet = findTradeable(this.player);
            }
        }
        // if is carry, trade in all only if region big
        else if (att == 'carry') {
            // use big force when has big region
            if (this.player.regions[0].length > 5) {
                var nextSet = findTradeable(this.player);
                // trade till can't
                while (nextSet != undefined) {
                    tradeSets.push(nextSet);
                    nextSet = findTradeable(this.player);
                }
            }
        }

        // helper: find tradeable set in player's hand
        function findTradeable(player) {
            // hand = indices of cards
            var hand = player.cards;
            var setToTrade = undefined;
            // if have 3 cards n more,
            if (hand.length > 2) {
                // enum subset
                var subset = cmb.combination(hand, 3);
                // loop till found tradeable set
                while (s = subset.next()) {
                    var sum = 0;
                    _.each(s, function(c) {
                        sum += deck[c].picture;
                    });
                    // 1. same pictures, sum%3 = 0
                    // 2. diff pictures, sum%3 = 0
                    // 3. any 2 pics w/ 1 wild, sum < 0
                    if (sum < 0 || sum % 3 == 0) {
                        // found, break and trade it
                        setToTrade = s;
                        break;
                    }
                }
            }
            // update hand
            player.cards = _.difference(hand, setToTrade);
            return setToTrade;
        };

        // convert one set (ind arr) to cards arr
        function toCards(setToTrade) {
                return _.map(setToTrade, function(i) {
                    return deck[i];
                });
            }
            // Finally, convert all tradeSets to cards
        var tradeSetsAsCards = _.map(tradeSets, toCards);
        return tradeSetsAsCards;
    };

};

exports.AI = AI;


// console.log(Ppriority);

// 2. Placement Algorithm
// 2.1 balance out most pressures
// 2.2 time-sensitive personalities:
// Keeping cards, delaying trade in:
// steamroller: attack continously. always expend all forces
// late-gamer: accumulate forces for late-game 

// May not be relevant now, is actually done via holding back cards
// do by wave, or use sin, or const


// 3. Attack Algorithm
// See number of forces can use now, attack while can
// Or use threshold: high = conservative, 0 = risky steamroller


var cmb = require('js-combinatorics').Combinatorics;

var id = [0, 1, 2, 3, 4, 5];
// var foo = cmb.combination(id,3);
// while(a = foo.next()) console.log(a);
// console.log(foo.toArray());

// var prod = cmb.cartesianProduct(_.keys(Pwf), _.keys(Ppriority), _.keys(Pplacement), _.keys(Pattack));
// console.log(prod.toArray());
