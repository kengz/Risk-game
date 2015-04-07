// AI = brain of player, will control the player object
// contains the personality
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


function AI(player, personality) {
    // AI brain controls the player
    this.player = player;
    // methods
    this.getArmies; // primary

    this.update;
    this.placeArmies;


    function getArmies() {
        // 1. count territories / 3 (floor). max of this or 3
        // 2. count continents w/ values (see map)
        // 3. trade in cards, count n-th set, match territory
      	var byTerritories = _.max([ Math.floor(this.player.countries.length / 3), 3]);
      	// var byContinents = 
    };

}

var priorityP = {
    'attack-then-defend': [0, 1, 2, 3],
    'opportunist-attack-then-defend': [1, 0, 2, 3],
    'defend-then-attack': [2, 3, 0, 1],
    'conservative-defend-then-attack': [3, 2, 0, 1]
}


console.log(priorityP);

// 2. Placement Algorithm
// Do only time-sensitive personalities:
// steamroller: attack continously. always expend all forces
// late-gamer: accumulate forces for late-game 

// May not be relevant now, is actually done via holding back cards
// do by wave, or use sin, or const
function holdback(armies, time) {

}


// 3. Attack Algorithm
// See number of forces can use now, attack while can


var cmb = require('js-combinatorics').Combinatorics;

var id = [0, 1, 2, 3];
var foo = cmb.permutation(id);
// console.log(foo.toArray());
