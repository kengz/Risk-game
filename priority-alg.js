// dependencies
var _ = require('underscore');
// import the worthiness metric
var f = require('./functions.js').fn;
// helper to calc the criterion
var ghelper = require('./graph.js').helper;



// Priority Algorithm: update worths, pressures, enunm priority list and att origins. 
// Input graph dg and bench = players
function PA(dg, bench) {
    this.enumPriority = enumPriority;
    this.mapAttOrigins = mapAttOrigins;
    this.updateForPriority = updateForPriority;

    // fields
    var g = dg;
    // graph helper
    var gh = new ghelper(g);


    ///////////////////
    // Priority List //
    ///////////////////

    // Primary: priority list by rolling forward
    function enumPriority(you, permutation, k) {
        // identity perm = [0,1,2,3]
        var id = [enumAttack, enumWeaken, enumThreat, enumLost];
        // the priority list
        var plist = [];
        // roll forward as specified by permutation
        _.each(permutation, function(i) {
            plist = rollk(plist, id[i](you), k);
        });
        // the list calls att-origin to reinforce
        return plist;
    };

    // rollforward: take the first k elements in back that aren't in front, append to it
    function rollk(front, back, k) {
        return _.union(front,
            _.first(
                // nodes in back but not in front
                _.difference(back, front), k)
        )
    };
    // list of attackable, ordered by worth
    var enumAttack = function(you) {
        return you.worths.enemy;
    };
    // list of attackable nodes weakened, from the least pressureDrop = highest pressure rise
    var enumWeaken = function(you) {
        return _.sortBy(you.attackable, -pressureDrop);
    };
    // list of your borders facing enemy buildup, from the most pressureDrop
    var enumThreat = function(you) {
        return _.sortBy(you.borders, pressureDrop);
    };
    // list of your lost nodes by worth (now enemy's)
    var enumLost = function(you) {
        // nodes in prev but not current
        var lost = _.difference(you.prevCountries, you.countries);
        // get the lost, ordered by worths
        return _.intersection(you.worths.self, lost);
    };
    // sort from low to high pressure rise, i.e. higher to lower pressure drop
    function pressureDrop(i) {
        return g.nodes[i].pressure - g.nodes[i].prevPressure;
    };

    // Primary: Attack-origin map: gives the best origin of attack for the priority lists: 
    // for attackable, choose highest pressure of adj that's yours; for borders(own), choose self, so the point itself is reinforced
    function mapAttOrigins(you) {
        // attack-origin map
        var attOrgMap = {};
        // find the best origin of attack for each attackable for reinforce
        _.each(you.attackable, function(i) {
            var optOrigins = _.filter(g.nodes[i].adjList,
                function(j) {
                    console.log("att neigh owner", g.nodes[j].owner);
                    return g.nodes[j].owner == you.name;
                });
            // create map: target –> best origin of att
            // var minFound = _.min(optOrigins, pressureSort);
            // 
            console.log("optOrigins", optOrigins);
            var minFound = findMin(optOrigins, pressureSort);
            console.log("min found", minFound);
            attOrgMap[i] = minFound;
            // attOrgMap[i] = findMin(optOrigins, pressureSort);
            if (attOrgMap[i] == Infinity) {
                console.log("inf error!");
            };
        });
        // if is your border, simply map to self for reinforce
        _.each(you.borders, function(j) {
            attOrgMap[j] = j;
        })
        return attOrgMap;
    };
    // sort from higher to lower pressure
    function pressureSort(i) {
        console.log("calling pressure sort index", i);
        console.log("presure sort", g.nodes[i].pressure);
        return (- g.nodes[i].pressure);
    };
    function findMin(arr, f) {
        var minKey = arr[0];
        for (var i = 0; i < arr.length; i++) {
            if(arr[i] < minKey) {
                minKey = arr[i];
            }
        };
        var minVal = f(minKey);
        return minKey;

    };


    /////////////////////////
    // Update for Priority //
    /////////////////////////
    // Primary: update for priority algorithm,
    // call pressure and worth computers
    function updateForPriority(player, wf) {
        updateWorths(player);
        updatePressures(player, wf);
        // countries at beginning of turn = prevCountries
        player.prevCountries = player.countries;
    };

    ///////////////////////
    // Pressure computer //
    ///////////////////////

    // Import from matrix computer
    var mcomp = require('./matrix-computer.js');
    // to create Node-Matrices and Army-Matrices; calcPressure
    var RMstoNMs = mcomp.RMstoNMs;
    var NMstoAMs = mcomp.NMstoAMs;
    var calcPressure = mcomp.calcPressure;
    NMs = RMstoNMs(dg);

    // helper-Primary: per-turn, update pressure
    function updatePressures(player, wf) {
        // update AMs
        var AMs = NMstoAMs(player, NMs);
        // update prevPressures
        player.prevPressures = player.pressures;
        // calc pressure, reflect army numbers surrounding the origins
        var pressNoOrigin = calcPressure(wf, AMs);
        // player.pressures = calcPressure(wf, AMs);
        // update pressures on player; on nodes for worth-calc
        for (var i = 0; i < player.pressures.length; i++) {
            // final pressure = origin's army vs avg army surrounding it
            player.pressures[i] = g.nodes[i].army + pressNoOrigin[i];
            // update on nodes for easy calc
            g.nodes[i].prevPressure = g.nodes[i].pressure;
            g.nodes[i].pressure = player.pressures[i];
        };
        return player.pressures;
    }


    ////////////////////
    // Worth Computer //
    ////////////////////

    // primary: calc and update the worth of every node, from your player perspective. return sorted node lists
    function updateWorths(you) {
        // update worth from your perspective
        updateCriterion();
        evalWorthByPlayers(you);
        // then partition by your/enemy's, sort nodes
        you.worths = sortByWorth(you);
        return you.worths;
    };

    // sort all nodes by evaluated worth, from perspective of you
    function sortByWorth(you) {
        // sort by self and enemy
        var self = you.borders;
        // var self = you.countries;
        var sortSelf = _.sortBy(self, worthSort);
        // var enemies = _.difference(clist, self);
        // attackable, sorted
        var enemies = you.attackable;
        var sortEnemy = _.sortBy(enemies, worthSort);
        return {
            self: sortSelf,
            enemy: sortEnemy
        }
    };
    // the sort function for worth, used above
    function worthSort(i) {
        return -g.nodes[i].worth;
    };

    // update priority for all players
    function updateCriterion() {
        // var gh = new ghelper(g);
        // need for each player in bench
        _.each(bench, function(p) {
            p.regions = gh.regions(p);
            p.borders = gh.borders(p);
            p.attackable = gh.attackable(p, p.borders);
            p.shapes = _.map(p.regions, function(r) {
                return gh.shape(p, r);
            })
        })
    };

    // Eval all nodes thru all regions of all players, from the perspective of player 'you'
    function evalWorthByPlayers(you) {
        _.each(bench, function(p) {
            evalWorthByRegions(p, you);
        })
    };

    // evaluate the worth of nodes in player p's regions
    function evalWorthByRegions(p, you) {
        // do by each region
        for (var i = 0; i < p.regions.length; i++) {
            // corresponding shape of region
            var shape = p.shapes[i];
            var region = p.regions[i];
            var roundness = shape.roundness;
            var mins = shape.mins;
            var maxs = shape.maxs;
            // call evalNodeWorthworth, with shape and reg size as input
            _.each(region, function(n) {
                // where n is a min or max node
                // is both min/max, or neither, val 0
                var minmax = 0;
                // is min, val -1
                if (_.contains(mins, n)) {
                    minmax = -1;
                }
                // is max (not min), val = 0+1;
                if (_.contains(maxs, n)) {
                    minmax++;
                }

                var regIndex = _.indexOf(_.flatten(p.regions), n);
                // att index, -1 if non-att by you
                var attIndex = -1;
                if (p.name == you.name) {
                    attIndex = _.indexOf(you.attackable, n);
                }

                // call eval on each node
                evalNodeWorth(n, roundness, minmax, regIndex, attIndex);
            })
        };
    };

    // Evaluate the worth of a node
    function evalNodeWorth(i, round, minMax, regIndex, attIndex) {
        // set node, for efficacy
        var node = g.nodes[i];

        // 1. continent-completion: get fraction
        var contFrac = gh.continentFrac(node);

        // 2. region size expansion. make big region even bigger?
        // regions are ordered by sizes (big first). Index of the node in its region
        var regionIndex = regIndex;
        // index of node in attackable, which is ordered by region size.
        // Is -1 if non-attackable from you
        var attackableIndex = attIndex;

        // 3. shape: 
        // measure shape: (max-min)/max. round(0), line(1)
        var roundness = round;
        // node is a min(-1), max(1), or both/none(0)
        var minmax = minMax;

        // 4. node degree
        var degree = node.adjList.length;

        // 5. retrieve its current pressure from update
        var pressure = node.pressure;

        // call function.js to eval worth, by metric
        // set node's worth
        node.worth = f.NodeWorth(contFrac, regionIndex, attackableIndex, roundness, minmax, degree, pressure);
    };


}


exports.PA = PA;
