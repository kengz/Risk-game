// Arena: Hosts an instance of the game. The place for all gamesteps and computations.
// All dynamic objects exist in here, and interact here, to maximize speed. All other classes need to exchange dynamic object through here.

/////////////////////////////////////
// Reinforce-attack call sequence: //
/////////////////////////////////////
// 1. update worths and pressures for nodes (between enemy turns to detect changes)
// 2. enumPriority w/ AI personality(permutation)
// 3. Reinforce based on priority lists and origin-map
// 4. attack by list


// Master Game wrapper: init and run everything in this file = an instance of game, with AI personalities, and player order: 
// if 1, AI1 first; if 0, AI2 first
function Game(pers1, pers2, firstplayer) {
// player order variable in gameturn
var first;
if (firstplayer == 'p1') { first = 1; }
else if (firstplayer == 'p2') { first = 0; }

////////////////////////////////
// the time-series for a game //
////////////////////////////////
var TS = {};
TS['first_player'] = firstplayer;
TS['AI1'] = pers1;
TS['AI2'] = pers2;
// set winner to tie first, if exist, reset below
TS['winner'] = 'tie';
// sample time series: TS[time] = t_data;


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
var AI1 = new AIM(p1, pers1, g);
var AI2 = new AIM(p2, pers2, g);
// third neutral AI runs with control
var control = ['Survival', 'agressive', 'cautious', 'rusher'];
var AI3 = new AIM(p3, control, g);

// The list of 3 AIs; third is neutral, doesn't do much
var AIlist = [AI3, AI1, AI2];
// the active AIs (without AI3)
var AIs = [AI1, AI2];




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
function initAIsetup() {
    // note: for fairness place AI3 first

    // remaining 26 armies per player, each AI take turn place 2
    for (var i = 0; i < 26/2; i++) {
        _.each(AIlist, placeTwo);
    };
    // get and place one army
    function placeTwo(ai) {
        AIupdate(ai);
        var army_given = ai.getArmies(2);
        ai.placeArmies();
    }
};




// One game turn of ai
function gameturn(ai) {
    // sample time series: TS[time] = t_data;
    // the time series data at this turn
    var t_data = {
        'turn': ai.name,
        'p1': {},
        'p2': {}
    };
    function setd1(ai, field) {
        t_data[ai.name][field] = ai.player[field];
    };
    function setd2(field, val) {
        t_data[field] = val;
    };

    // 1. first update info: Priority Algorithm
    AIupdate(ai);
    // update for t_data
    // count: var starts with 'n_var'
    t_data[ai.name]['n_countries'] = ai.countCountries();
    t_data[other(ai).name]['n_countries'] = other(ai).countCountries();
    t_data[ai.name]['n_continents'] = ai.countContinents();
    t_data[other(ai).name]['n_continents'] = other(ai).countContinents();
    // setd1(ai, 'countries'); setd1(other(ai), 'countries');
    // setd1(ai, 'continents'); setd1(other(ai), 'continents');
    // setd1(ai, 'regions'); setd1(other(ai), 'regions');
    // setd1(ai, 'pressures'); setd1(other(ai), 'pressures');


    // 2. then get armies and place them: Placement alg
    var army_given = ai.getArmies(
        dealer.giveArmies(ai.player, ai.tradeIn())
        );
    ai.placeArmies();
    // update for t_data
    t_data[ai.name]['n_army_given'] = army_given;
    t_data[other(ai).name]['n_army_given'] = 0;
    t_data[ai.name]['n_total_army'] = ai.countArmy();
    t_data[other(ai).name]['n_total_army'] = other(ai).countArmy();

    // 3. then attack: Attack alg. include owner/army transfer
    var attres = dealer.mediateAttacks(ai, other(ai));
    // update for t_data
    t_data['n_attacks'] = attres['n_attacks'];
    // t_data['all_outcomes'] = attres['all_outcomes'];
    t_data['n_conquered'] = attres['n_conquered'];


    // 4. attacks end; fortify
    ai.fortify();
    // 5. after all attacks ended, update continents
    dealer.updateContinents(bench);

    // Check end of game, i.e. opponent has no countries. 
    // Then ai is winner.
    var end = false;
    if (other(ai).player.countries.length == 0) {
        end = true;
    };
    t_data['end'] = end;
    return t_data;
    // return end;
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
        // t_data at time
        var td;
        // take turn. player order [0,1]
        // if 1, AI1 first; if 0, AI2 first
        if (time % 2 == first) {
            td = gameturn(AI1);
            end = td.end;
            winner = AI1.name;
        } else {
            td = gameturn(AI2);
            end = td.end;
            winner = AI2.name;
        };
        // set series t_data for time
        TS[time] = td;

        // end game if winner arises
        if (end) {
            // set winner in TS
            TS['winner'] = winner;
            console.log("\n=====================");
            console.log("Game ends with winner", winner);
            console.log("at turn", time);
            console.log("Printing stats:");
            printStats(AI1);
            printStats(AI2);
            break;
        };
        // or doesn't end
        if (time==max) {
            console.log("\n=====================");
            console.log("Game ends without winner");
            console.log("at turn", time);
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



////////////////////////
// Finally, return TS //
////////////////////////
return TS;



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




}


exports.Game = Game;