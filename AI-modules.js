// dependencies
var _ = require('underscore');

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
    this.tradeIn;
    this.getArmies;

    this.update;
    this.placeArmies;


};

exports.AI = AI;

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
