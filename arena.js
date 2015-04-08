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

// return player object from bench by name
function getPlayer(name) {
    return _.find(bench, function(p) {
        return p.name == name;
    });
}

/////////////////////////////////////
// Reinforce-attack call sequence: //
/////////////////////////////////////
// 1. update worths and pressures for nodes (between enemy turns to detect changes)
// 2. enumPriority w/ AI personality(permutation)
// 3. Reinforce based on priority lists and origin-map
// 4. attack by list

// Global Priority algorithm to update AI info for calc
var PrioAlg = require('./priority-alg.js');
var PA = new PrioAlg.PA(g, bench);
// size of 4 sublists of priorityList
var priorityStep = 4;

// AI updating its info before moves
function AIupdate(ai) {
    // update worths, pressures, using AI's 'wf' trait
    PA.updateForPriority(ai.player, ai.trait('wf'));
    // return map of all best origins(own) of attack
    var attOrgMap = PA.mapAttOrigins(ai.player);
    // enumerate the priority target list, step = 3
    var priorityList = PA.enumPriority(ai.player, ai.trait('priority'), priorityStep);
    // set orgMap and plist for AI
    ai.attOrgMap = attOrgMap;
    ai.priorityList = priorityList;
};


// Global dealer: gives cards and armies 
var dealerM = require('./dealer.js').dealer;
var dealer = new dealerM(g);

// Global AI mod constructor
var AIM = require('./AI-modules.js').AI;
// sample trait
var test = ['Constant', 'agressive', 'cautious', 'rusher'];
var AI1 = new AIM(p1, test, g);
var AI2 = new AIM(p2, test, g);
var AI3 = new AIM(p3, test, g);

// The list of 3 AIs; third is neutral, doesn't do much
var AIlist = [AI1, AI2, AI3];
// the active AIs (without AI3)
var AIs = [AI1, AI2];

// return the other AI different from ai, in AIs
function other(ai) {
    for (var i = 0; i < AIs.length; i++) {
        if (AIs[i].name == ai.name) {
            return AIs[i];
        }
    };
};

// Finish the initialization: AI updates and places remaining armies.
// Is primitive, kinda random
function initAIsetup() {
    // wait all 3 AI has updated
    _.map(AIlist, AIupdate);
    // then all 3 place armies
    _.each(AIlist, function(ai) {
        ai.placeArmies();
    })
};

initAIsetup();


// a turn
function turn(ai) {
    // first update info: Priority Algorithm
    AIupdate(ai);
    // then get armies and place them: Placement alg
    ai.getArmies(
        dealer.giveArmies(ai.player, ai.tradeIn())
    );
    ai.placeArmies();
    // then attack: Attack alg. include owner/army transfer
    dealer.mediateAttacks(ai, other(ai));

    // fortify
    ai.fortify();
    // after all attacks ended, update continents
    dealer.updateContinents(bench);

    var end = false;
    // check winner
    if (other(ai).player.countries.length==0) {
        end = true;
    };
    return end;
}


function run() {
    var time = 100;
    while (time>0) {
        time--;
        var end = false;
        if (time%2 != 0) {
            end = turn(AI1);
        }
        else {
            end = turn(AI2);
        }
        if (end) {
            console.log("game ending at time", time);
            break;
        };
    }
}

run();

// console.log("army num", AI1.priorityList);
console.log("army num", AI1.player.prevCountries);
console.log("army num", AI1.player.countries);
console.log("army num", AI1.countArmy());
turn(AI1);
console.log("army num", AI1.player.prevCountries);
console.log("army num", AI1.player.countries);
// console.log("army num", AI1.priorityList);
console.log("army num", AI1.countArmy());


// AI1.fortify();




// update on graph node, update on player countries, 
// at turn's end, update continent

// handle if tar army = 0, move in
// check n update continent, 
// player country list

// recurse from top

var ar = _.range(5);
console.log("test", ar);
// ar.remove(3);
function remove(array, item) {
    var index = array.indexOf(item);
    array.splice(index, 1);
    return array;
}
remove(ar, 3);
console.log("test", ar);
// console.log(foo);
// console.log(p1);

// console.log(dealer.roll(3,2));


// console.log(AI);
// console.log(AI.getArmies());




// console.log(deck);
// console.log(p1);


// Timer
var start = new Date().getTime();
for (i = 0; i < 100; ++i) {
    // turn(AI1);
    // AIupdate(AI);
    // dealer.getArmies(AI.player, AI.tradeIn());
}
var end = new Date().getTime();
var time = end - start;
// console.log(p1);
// console.log(g.nodes[0]);
console.log('Execution time: ' + time);

// console.log(g);
