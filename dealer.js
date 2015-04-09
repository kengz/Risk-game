// Dealer, i.e. the controller class that imposes the rules in dealing cards and giving armies

// dependencies
var _ = require('underscore');

var Dice = require('./kit.js').Dice;

// dealer = rule dealer
function dealer(dg) {
    this.updateContinents = updateContinents;
    this.mediateAttacks = mediateAttacks;
    this.d = new Dice();
    this.roll = roll;
    this.giveArmies = giveArmies;
    this.dealCard = dealCard;

    var g = dg;
    // sets of cards traded in so far
    var setTraded = 0;
    // armies worth per continent
    var contWorth = require('./srcdata/continent-army-worth.json');
    // the continents
    var contis = require('./srcdata/continents.json');

    // the deck of cards & shuffle sequence
    var deck = require('./srcdata/deck.json');
    var shuffle = _.shuffle(_.range(42 + 2));


    //////////////////////
    // updateContinents //
    //////////////////////

    // update which player owns which continents (entirely)
    function updateContinents(bench) {
        console.log("updateContinents");
        // clear all players continents list
        _.each(bench, function(player) {
            player.continents = [];
        });

        // scan each continents' nodes
        _.each(_.keys(contis), function(name) {
            // console.log("contien", name);
            var first = _.first(contis[name]);
            var owner1 = g.nodes[first].owner;
            var same = true;
            _.each(contis[name], function(c) {
                if (g.nodes[c].owner != owner1) {
                    same = false;
                };
            });
            // if all countries in con owned by same player
            if (same) {
                // push name of continent to it
                getPlayer(owner1).continents.push(name);
            };
        });
        // return player object from bench by name
        function getPlayer(name) {
            return _.find(bench, function(p) {
                return p.name == name;
            });
        };
    };


    ////////////////////
    // mediateAttacks //
    ////////////////////

    // mediates Attack from ai to anotherai
    function mediateAttacks(ai, otherai) {
        console.log("mediateAttacks");
        var ai = ai;
        var conquered = 0;
        var conqArr = [];
        // init ai attack
        var att = ai.attack();
        checkOwner();
        // while ai keeps attacking
        while (att != undefined) {
            // attack request object: triple
            var org = att.origin;
            var tar = att.target;
            var red = att.roll;
            var white = otherai.defend(att);
            // outcome: binary vector, rep attacker's win
            var outcome = this.roll(red, white);
            var attacker = g.nodes[org];
            var defender = g.nodes[tar];
            checkOwner();
            // console.log("org, tar", org, tar);
            // console.log("r,w", red, white);
            // console.log("outcome:", outcome);
            // console.log("b4 transfer");
            // console.log(attacker.army);
            // console.log(defender.army);
            // update army numbers from outcome
            _.each(outcome, function(a) {
                if (a > 0) {
                    defender.army += -a; // defender loses
                } else if (a < 0) {
                    attacker.army += a; // attacker loses
                }
            });

            // if node conquered, transfer ownership n army
            if (defender.army == 0) {
                conquered++;
                conqArr.push(tar);
                console.log("node conquered!", org, tar);
                // update node owner
                console.log("transfer node", tar, "from", defender.owner, "to", ai.name);
                defender['owner'] = ai.name;
                console.log("done transfer, new owner", defender.owner);
                // update players countries   
                ai.player.countries.push(tar);
                otherai.player.countries = _.without(otherai.player.countries, tar);
                console.log("new owner has it?", _.contains(ai.player.countries, tar));
                console.log("other still has it?", _.contains(otherai.player.countries, tar));
                // move in armies, from org to tar
                ai.moveIn(org, tar);
            };
            // console.log("after transfer");
            // console.log(attacker.army);
            // console.log(defender.army);

            // refresh for next attack
            att = ai.attack();
        }
        // attacks end
        console.log("check ownership from dealer AI");
        console.log(ai.name, "owns", _.sortBy(ai.player.countries));
        console.log(otherai.name, "owns", _.sortBy(otherai.player.countries));
        checkOwner();


        function checkOwner() {
            var co = [];
            _.each(_.range(42), function(i) {
                co.push(g.nodes[i].owner);
            });
            var map = _.object(_.range(42), co);
    // console.log(map);
    var c1 = [], c2 = [], c3 = [];
    _.each(_.keys(map), function(k) {
        var val = map[k];
        if (val == 'p1') { c1.push(parseInt(k)); }
        else if (val == 'p2') { c2.push(parseInt(k)); }
        else if (val == 'p3') { c3.push(parseInt(k)); }
    })
    // console.log("owners", co);
    console.log("checking owners FROM DEALER");
    console.log("p1 from g\t\t", _.sortBy(c1));
    // console.log("p1 from player", p1.countries);
    console.log("p2 from g\t\t", _.sortBy(c2));
    // console.log("p2 from player", p2.countries);
    console.log("p3 from g\t\t", _.sortBy(c3));
    console.log("p1 from player\t", _.sortBy(ai.player.countries))
    console.log("p2 from player\t", _.sortBy(otherai.player.countries))
    // console.log("p3 from player", p3.countries);
    // var d1 = _.difference(c1, p1.countries);
    // if (d1.length != 0) {console.log("error p1!", d1)};
    // var d2 = _.difference(c2, p2.countries);
    // if (d2.length != 0) {console.log("error p2!", d2)};
    // var d3 = _.difference(c3, p3.countries);
    // if (d3.length != 0) {console.log("error p3!", d3)};
}

        // deal a card to ai player if conquered something
        if (conquered > 0) {
            console.log("get a card! conquered:", conquered, _.sortBy(conqArr));
            var c = this.dealCard();
            ai.player.cards.push(c);
        };

    };


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
        // outcome only up to what white puts in
        return outcome.slice(0, w);
    }

    ////////////////
    // Deal cards //
    ////////////////
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
