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



/////////////////////////////////////
// Reinforce-attack call sequence: //
/////////////////////////////////////
// 1. update worths and pressures for nodes (between enemy turns to detect changes)
// 2. enumPriority w/ AI personality(permutation)
// 3. Reinforce based on priority lists and origin-map
// 4. attack by list

// Global dealer: gives cards and armies 
var dealerM = require('./dealer.js').dealer;
var dealer = new dealerM(g);
// global AI mod
var AIM = require('./AI-modules.js').AI;
var test = ['Constant', 'agressive', 'cautious', 'rusher'];
var AI = new AIM(p1, test, g);
var AI2 = new AIM(p2, test, g);
var AI3 = new AIM(p3, test, g);

// Global AI-updater for priority list
var PrioAlg = require('./priority-alg.js');
var PA = new PrioAlg.PA(g, bench);

// AI updating its info before moves
function AIupdate(AI) {
    // update worths, pressures, using AI's 'wf' trait
    PA.updateForPriority(AI.player, AI.trait('wf'));
    // return map of all best origins of attack
    var attOrgMap = PA.mapAttOrigins(AI.player);
    // enumerate the priority target list, step = 3
    var priorityList = PA.enumPriority(AI.player, AI.trait('priority'), 3);
    // set orgMap and plist for AI
    AI.attOrgMap = attOrgMap;
    AI.priorityList = priorityList;
};


var AIlist = [AI, AI2, AI3];
function initAIturn(ai) {
    AIupdate(ai);
    ai.placeArmies();
};

_.each(AIlist, function(ai) {
    initAIturn(ai);
});


// AIupdate(AI);
// // AI getting armies: trade in and call dealer giveArmies
// console.log("before", p1.cards);
// console.log(AI.personality);
// console.log("arm b4", p1.armyreserve);
// AI.getArmies(
//     dealer.giveArmies(AI.player, AI.tradeIn())
//     );
// console.log("arm after", p1.armyreserve);
// console.log(p1.pressures);
// AI.placeArmies();


function aTurn(ai) {
    AIupdate(ai);
    AI.getArmies(
    dealer.giveArmies(AI.player, AI.tradeIn())
    );
    AI.placeArmies();
}

aTurn(AI);

_.each(g.nodes, function(n) {
    console.log(n.army);
})
// AI will call dealer method with its cards to trade in



var att = AI.attack();
var org = att.origin;
var tar = att.target;
var red = att.roll;
var white = AI2.defend(att);
console.log("r,w", red, white);
var outcome = dealer.roll(red,white);
console.log("outcome:", outcome);
console.log("b4 transfer");
console.log(g.nodes[org].army);
console.log(g.nodes[tar].army);
_.each(outcome, function(a) {
    // target loses
    if (a > 0) {
        g.nodes[tar].army += -a;
    }
    // origin loses
    else if (a < 0) {
        g.nodes[org].army += a;
    }
    
    
})

console.log("after transfer");
console.log(g.nodes[org].army);
console.log(g.nodes[tar].army);

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
    // AIupdate(AI);
    // dealer.getArmies(AI.player, AI.tradeIn());
}
var end = new Date().getTime();
var time = end - start;
// console.log(p1);
// console.log(g.nodes[0]);
console.log('Execution time: ' + time);

// console.log(g);
