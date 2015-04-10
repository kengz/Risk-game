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
function AI(player, persona, dg) {
	// global graph object
    var g = dg;

    ////////////
    // Fields //
    ////////////
    // player which has all the fields
    this.player = player;
    this.name = player.name;
    // Personality map of AI, e.g. priority: 'agressive'
    this.personality = _.object(traitsKey, persona);
    // get this AI's trait, e.g. priority -> [0,1,2,3]
    this.trait = trait;
    function trait(key) {
        return traitsMap[key][this.personality[key]];
    };

    // The attack-origin map and priority list
    // enumerate with sublists size = 3 x4 = 12
    this.priorityList = [];
    this.attOrgMap = {};

    /////////////
    // Methods //
    /////////////
    this.tradeIn = tradeIn;
    this.getArmies = getArmies;
    // place armies, with threshold step t = 5
    this.placeArmies = placeArmies;
    // count number of armies owned on map
    this.countArmy = countArmy;
    // count number of countries owned
    this.countCountries = countCountries;
    this.countContinents = countContinents;

    // The attack moves
    this.attack = attack;
    this.defend = defend;
    this.moveIn = moveIn;
    this.fortify = fortify;

    function fortify() {
    	console.log("fortify");
        // find border node with lowest pressure
        // find none-border node with AM higher than it
        // if is neigh of it, then move in all but 1
        
        // borders sorted by pressure from lowest
        var coun = _.sortBy(this.player.countries, byPressure);
        var fortified = false;
        // call on coun till fortified one, or none
        for (var i = 0; i < coun.length; i++) {
            // fortify by moving troops from internal node with high pressure
            var found = hiPressNonBorderNeigh(coun[i], this.player);
            // console.log("to fortify node", found);
            if (found != undefined) {
            	this.moveIn(found, coun[i]);
            	// if move in once, done, break
                fortified = true;
                return 0;
            }
        };
        // after trying all, if none, then move anything to a highest pressure border node
        if (!fortified) {
            for (var i = 0; i < coun.length; i++) {
                console.log("fortifying by accumulation");
                var neighs = _.intersection(coun, g.nodes[coun[i]].adjList);
                var maxNeigh = _.last(neighs);
                if (maxNeigh != undefined) {
                    this.moveIn(maxNeigh, coun[i]);
                    fortified = true;
                    return 0;
                };
            };
        };

        // helper: return an ideal hi pressure non-border neighbor that can transfer troop to border node[i]
        function hiPressNonBorderNeigh(i, plyr) {
            var nonBorderNeigh = _.difference(g.nodes[i].adjList, plyr.borders);
            // console.log("found neigh", nonBorderNeigh);
            var neighPressDiff = _.map(nonBorderNeigh, function(k) {
                return g.nodes[k].pressure - g.nodes[i].pressure;
            });
            // the max pressure difference
            var max = _.max(neighPressDiff);
            if (max > 3) {
            	// console.log("found big hike");
                var mInd = _.findIndex(neighPressDiff, function(m) {
                    return Math.floor(Math.abs(m-max))==0;
                });
                // console.log("to return", mInd, nonBorderNeigh[mInd]);
                return nonBorderNeigh[mInd];
            };
            // else return undefine
        }
        // sort helper
        function byPressure(i) {
            return g.nodes[i].pressure;
        }
    };

    // move in: always move all but one
    function moveIn(org, tar) {
    	console.log("moveIn");
    	// failsafe
        if (g.nodes[tar].owner != this.name && g.nodes[tar].army != 0) {
            console.log("moveIn error!")
        };
        // console.log("before moveIn", g.nodes[org].army, g.nodes[tar].army);
        // extract
        var num = g.nodes[org].army;
        // transfer
        g.nodes[tar].army = num - 1;
        g.nodes[org].army = 1;
        // console.log("after moveIn", g.nodes[org].army, g.nodes[tar].army);
        // console.log("transferred all but one", g.nodes[org].army, g.nodes[tar].army);
    };

    // defending when enemy rolls 'red' number of dice
    function defend(att) {
    	console.log("defend");
        // object returned from attack()
        var org = att.origin;
        var tar = att.target;
        var red = att.roll;
        // to counter, always use max rolls possible
        var need = _.min([2, red]);
        var afford = _.min([need, g.nodes[tar].army]);
        // return white rolls
        return afford;
    };

    // attack based on priorityList and personality threshold. Called until return undefined.
    // Return attack request {origin, tar, roll} to dealer
    function attack() {
    	// console.log("attack");
        // extract personality
        var att = this.personality['attack'];
        var playername = this.player.name;

        // for each target, attack if source.army - target.army > threshold
        var prio = this.priorityList;
        var attOrg = this.attOrgMap;

        // return att request to dealer
        return strike(this.trait('attack'), playername);

        // helper: based on personality threshold, initiate attack by sending request to dealer
        function strike(threshold, playername) {
            if (prio.length == 0) {
                console.log("priority list empty!");
            };
            // target in prio list, loop
            for (var j = 0; j < prio.length; j++) {
                // att origin
                // i = node index at prio[j]
                var i = prio[j];
                var o = attOrg[i];
                // verify is enemy and origin is self,
                // origin must have at least 2 armies,
                // enemy is still attackable
                if (g.nodes[i].owner != playername &&
                    g.nodes[o].owner == playername &&
                    g.nodes[o].army >= 2 &&
                    g.nodes[i].army > 0) {
                    console.log("attempt attack");
                    // check if army number >= threshold/2, so that can keep attacking after first time
                    var diff = g.nodes[o].army - g.nodes[i].army;
                    // loop until wanna attack, return
                    if (diff >= threshold / 2) {
                        // number of dice to roll
                        var roll = _.min([3, diff]);
                        return {
                            origin: o,
                            target: i,
                            roll: roll
                        }
                    };
                };
            }
        };

    };

    // count number of continents owned
    function countContinents() {
    	return this.player.continents.length;
    }
    // count number of countries owned
    function countCountries() {
    	return this.player.countries.length;
    };

    // Count its army currently deployed
    function countArmy() {
        var sum = 0;
        _.each(this.player.countries, function(i) {
            sum += g.nodes[i].army;
        })
        return sum;
    };


    // place armies based on personality, balance pressures
    function placeArmies() {
    	console.log("placeArmies");
        // the army counterpressure threshold
        var threshold = 4;
        // extract personality
        var placem = this.personality['placement'];

        // the pressures and priority list copied for use
        var press = this.player.pressures;
        var prio = this.priorityList;
        var attOrg = this.attOrgMap;

        // deplete armyreserve
        var stock = this.player.armyreserve;
        // console.log("army reserve", stock, prio);
        // console.log("countries owned", this.player.countries);
        // console.log("attackable", this.player.attackable);
        this.player.armyreserve = 0;

        if (placem == 'cautious') {
            // balance all pri pressure >0 first,
            distribute(0);
            // then topup priority by half threshold
            while (stock > 0) {
                distribute(threshold / 2);
            };
        }
        // priority pressure >4 +=4 repeatedly
        else if (placem == 'tactical') {
            while (stock > 0) {
                distribute(threshold);
            };
        }
        // helper: distribute 'num' army by priorityList
        function distribute(t) {
            var t = Math.floor(t);
            _.each(prio, function(i) {
                // army needed
                var need = _.max([t + Math.ceil(-press[i]), t]);
                // affordable, either need or stock left
                var afford = _.min([need, stock]);
                // take out, give army to node
                stock -= afford;
                // add army to your attack origin of i
                var org = attOrg[i];
                g.nodes[org].army += afford;
            });
        };

    };

    // get armies from dealer(given). 
    // Add to reserve for placement
    function getArmies(given) {
        this.player.armyreserve += given;
        return given;
    };

    // AI trade in cards based on personality, to call giveArmies from dealer
    function tradeIn() {
    	console.log("tradeIn");
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
        	console.log("findTradeable");
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





// // Export traits as personalities to json
// var fs = require('fs');
// var traitsMap = require('./srcdata/AI-traits.json');

// // export the vectors of AI personalities
// function exportPers() {
//     // delete unwanted
//     delete traitsMap.help;
//     delete traitsMap.wf["Linear"];
//     delete traitsMap.wf["Gauss"];
//     delete traitsMap.wf["ExpDecay"];
//     delete traitsMap.priority["opportunist-attack-then-defend"];
//     delete traitsMap.priority["conservative-defend-then-attack"];

//     // get vector of sets of trait values
//     var tKeys = _.keys(traitsMap);
//     var a = _.map(tKeys, function(k) {
//         return _.keys(traitsMap[k]);
//     })

//     // take the cartesianProduct for personalities
//     cp = cmb.cartesianProduct(a[0], a[1], a[2], a[3]);
//     var pers = cp.toArray();
//     console.log(pers);

//     fs.writeFileSync('./srcdata/AI-personalities.json', JSON.stringify(pers, null, 4));
// }

// exportPers();
