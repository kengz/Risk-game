// Arena: Hosts an instance of the game. The place for all gamesteps and computations.
// All dynamic objects exist in here, and interact here, to maximize speed. All other classes need to exchange dynamic object through here.

/////////////////////////////////////
// Reinforce-attack call sequence: //
/////////////////////////////////////
// 1. update worths and pressures for nodes (between enemy turns to detect changes)
// 2. enumPriority w/ AI personality(permutation)
// 3. Reinforce based on priority lists and origin-map
// 4. attack by list

///////////////////////////////
// dependencies, enumeration //
///////////////////////////////
var _ = require('underscore');

// primary dynamic objects:
var g; //graph (the board/map)
var bench, p1, p2, p3; // bench = players

// Global dealer: gives cards and armies 
var dealerM = require('./dealer.js').dealer;
// Global AI mod constructor
var AIM = require('./AI-modules.js').AI;
// Global Priority algorithm to update AI info for calc
var PrioAlg = require('./priority-alg.js');

///////////////////////////////////////////
// Imports, Initialization, Constructors //
///////////////////////////////////////////

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

// Construct a global dealer
var dealer = new dealerM(g);

// Construct a global priorty algorithm for AI calc
var PA = new PrioAlg.PA(g, bench);
// size of 4 sublists of priorityList
var priorityStep = 4;



/////////////////////
// AI construction //
/////////////////////

// Construct AI's with players controlled
var test = ['Survival', 'agressive', 'cautious', 'rusher'];
var AI1 = new AIM(p1, test, g);
var AI2 = new AIM(p2, test, g);
var AI3 = new AIM(p3, test, g);

// The list of 3 AIs; third is neutral, doesn't do much
var AIlist = [AI1, AI2, AI3];
// the active AIs (without AI3)
var AIs = [AI1, AI2];


// constructor from initMap to play all
function constructAIs(a1, a2) {

}


////////////////////////////
// Primary-helper methods //
////////////////////////////

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



// One game turn of ai
function gameturn(ai) {
    // first update info: Priority Algorithm
    AIupdate(ai);
    // then get armies and place them: Placement alg
    ai.getArmies(
        dealer.giveArmies(ai.player, ai.tradeIn())
        );
    ai.placeArmies();
    // then attack: Attack alg. include owner/army transfer
    dealer.mediateAttacks(ai, other(ai));

    // attacks end; fortify
    ai.fortify();
    // after all attacks ended, update continents
    dealer.updateContinents(bench);

    // Check end of game, i.e. opponent has no countries. 
    // Then ai is winner.
    var end = false;
    if (other(ai).player.countries.length == 0) {
        end = true;
    };
    return end;
}


//////////////////////////////
// The main runGame method. //
//////////////////////////////
// Runs an instance of the game
// Init and run till end of a game, or max-time
function runGame(max) {
    // init
    initAIsetup();
    // timer for game, ++ per turn
    var time = 0;
    while (time < max) {
        time++;
        console.log("\nTURN", time);
        // check end of game
        var end = false;
        var winner = "No One";
        // take turn
        if (time % 2 != 0) {
            end = gameturn(AI1);
            winner = AI1.name;
        } else {
            end = gameturn(AI2);
            winner = AI2.name;
        };
        // end game if winner arises
        if (end) {
            console.log("\n=====================");
            console.log("Game ends with winner", winner);
            console.log("Printing stats:");
            printStats(AI1);
            printStats(AI2);
            break;
        };
        // or doesn't end
        if (time==max) {
            console.log("\n=====================");
            console.log("Game ends without winner");
            console.log("Printing stats:");
            printStats(AI1);
            printStats(AI2);
        };
    }
}

// Call and time the runGame
var max = 300;
// Timer
var start = new Date().getTime();
runGame(max);
var end = new Date().getTime();
var time = end - start;
console.log('Execution time: ' + time);





/////////////
// Helpers //
/////////////


function printStats(ai) {
    console.log("------------------------");
    console.log("AI:\t\t", ai.name);
    console.log("Countries:\t", ai.countCountries());
    console.log("Continent:\t", ai.countContinents());
    console.log("Armies:\t\t", ai.countArmy());
    console.log("------------------------");
}
// Helper: return the other AI different from ai, in AIs
function other(ai) {
    for (var i = 0; i < AIs.length; i++) {
        if (AIs[i].name != ai.name) {
            return AIs[i];
        }
    };
};

// Debugger to check owner of nodes
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
    console.log("checking owners from ARENA");
    console.log("p1 from g\t\t", _.sortBy(c1));
    console.log("p2 from g\t\t", _.sortBy(c2));
    console.log("p3 from g\t\t", _.sortBy(c3));
    console.log("p1 from player\t", _.sortBy(p1.countries));
    console.log("p2 from player\t", _.sortBy(p2.countries));
    console.log("p3 from player\t", _.sortBy(p3.countries));
    var d1 = _.difference(c1, p1.countries);
    if (d1.length != 0) {console.log("error p1!", d1)};
    var d2 = _.difference(c2, p2.countries);
    if (d2.length != 0) {console.log("error p2!", d2)};
    var d3 = _.difference(c3, p3.countries);
    if (d3.length != 0) {console.log("error p3!", d3)};
}