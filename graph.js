// The graph class and graph methods

// Dependencies
var _ = require('underscore');

// INSERT:
// scan for region, disconnected subgraph, find min n max dist bet any pair of border points

// The graph class = world map
function Graph() {
    this.nodes = [];
    this.addNode = addNode;

    function addNode(Name, continent) {
        temp = new Node(Name, continent);
        this.nodes.push(temp);
        return temp;
    }
}
// The node for graph. game = country index
function Node(Name, Continent) {
    this.name = Name;
    this.continent = Continent;
    this.adjList = [];
    this.addEdge = addEdge;

    function addEdge(neighbour) {
        if (this.adjList.indexOf(neighbour) == -1)
            this.adjList.push(neighbour);
    }
    // fields for the game:
    // player owning this node
    this.owner = "none";
    // number of owner's army on this node
    this.army = 0;
    // pressure from AM matrix, previous and current
    this.prevPressure = 0;
    this.pressure = 0;
    // worth, or value, from degree, etc
    this.worth = 0;
}



//////////////////////////////////
// The helper methods for graph //
//////////////////////////////////

function helper(dg) {
    this.regions = regions;
    this.borders = borders;
    this.attackable = attackable;
    this.dist = dist;
    this.shape = shape;
    this.continentFrac = continentFrac;

    // the dynamic graph for use below
    var g = dg;

    // split player's countries into regions = connected subgraph, of the dynamic graph dg
    function regions(player) {
        // list of my regions
        var myregions = [];
        // my countries
        var minestatic = _.sortBy(player.countries);
        var mine = _.sortBy(player.countries);

        // function to find next of your connected region
        function enumNextRegion() {
            // add first base to new region
            var newreg = [mine[0]];
            // then remove first from nodes
            mine = _.rest(mine);
            // new region found, add
            newreg = _.union(newreg, myconnected(newreg));
            myregions.push(newreg);
            // update mine
            mine = _.difference(mine, newreg);
        }

        // my nodes that are already checked
        var checked = [];
        // get my nodes that are connected, input radius arr
        function myconnected(radarr) {
            // next radius adj nodes from radarr
            var nextRad = [];
            // from next radius arr, expand radius further
            _.each(radarr, function(i) {
                // adj to radarr element that's mine
                var adjMine = _.difference(_.intersection(g.nodes[i].adjList, minestatic), checked);
                nextRad.push(adjMine);
            });
            // the next radius from radarr
            nextRad = _.uniq(_.flatten(nextRad));
            // update checked
            checked = _.union(checked, nextRad);
            // recurse while still has more
            if (nextRad.length != 0) {
                return _.flatten(
                    _.union(
                        nextRad,
                        myconnected(nextRad)
                        ))
            } else {
                return [];
            }
        }

        // call enum
        while (mine.length != 0) {
            enumNextRegion();
        }

        // sort regions by size
        myregions = _.sortBy(myregions, function(r) {
            return -r.length;
        });

        return myregions;
    };

    // enum the border nodes of a player
    // Ordered by the regions
    function borders(player) {
        var bnodes = [];
        // console.log("player flatten region", player.name, _.flatten(player.regions));
        // start from player regions for ordering
        // for all my owned nodes n
        _.each(_.flatten(player.regions), function(n) {
            // all its neigh is assumed mine
            var neighsmine = true;
            // until check, see n's neighs
            _.each(g.nodes[n].adjList, function(i) {
                // if found neigh not mine, make false
                if (g.nodes[i].owner != player.name) {neighsmine = false;
                };
            });
            // but I want n with neigh = not mine
                if (!neighsmine) {
                    bnodes.push(n);
                }
            })
        return bnodes;
    };

    // all the attackable nodes from player's borders
    // retain ordering from borders, from regions
    function attackable(player, borders) {
        var att = [];
        // for each border node of player
        _.each(borders, function(b) {
            // check its neighs
            _.each(g.nodes[b].adjList, function(a) {
                // if not in player countries, is enemy
                if (!_.contains(player.countries, a)) {
                    if (!_.contains(att, a)) {
                        att.push(a);
                    }
                };
            })
        })
        return att;
    };


    // min distance between nodes i,j
    function dist(i, j) {
        // distance 0 first, init wave
        var d = 0;
        var wave = [i];
        // while next wave(radius-expand) has no j
        while (!_.contains(wave, j)) {
            // expand wave
            _.each(wave, function(n) {
                _.each(g.nodes[n].adjList, function(k) {
                    if (!_.contains(wave, k)) wave.push(k);
                })
            })
                // increment d for a radius expansion
                d++;
            }
            return d;
        };


    // Calc the shape of a region, i.e. connected countries. by max - min
    // Return a random max/min pair of pairs
    function shape(player, region) {
        // calc radius only for border nodes in a region
        var reg = _.intersection(region, player.borders);
        // var reg = region;
        // the node-pair with min/max dist
        var minpair = {
            d: 50,
            nodes: []
        },
        maxpair = {
            d: 0,
            nodes: []
        };
        // upperbound = reg size
        var up = reg.length;
        if (up > 1) {
            // enum pair of reg
            for (var i = 0; i < up - 1; i++) {
                for (var j = i + 1; j < up; j++) {
                    var dis = dist(reg[i], reg[j]);
                    // if find new min pair, update
                    if (dis < minpair.d) {
                        minpair.d = dis;
                        // nodes forming min-pairs
                        minpair.nodes = [i, j];
                        // minpair['i'] = i;
                        // minpair['j'] = j;
                    }
                    // if another max found, add
                    if (dis == minpair.d) {
                        minpair.nodes.push(i);
                        minpair.nodes.push(j);
                    }
                    // if find max pair, update
                    if (maxpair.d < dis) {
                        maxpair.d = dis;
                        // nodes forming max-pairs
                        maxpair.nodes = [i, j];
                        // maxpair['i'] = i;
                        // maxpair['j'] = j;
                    }
                    // if another max found, add
                    if (dis == maxpair.d) {
                        maxpair.nodes.push(i);
                        maxpair.nodes.push(j);
                    }
                };
            };
            // the difference in radius
            var diff = maxpair.d - minpair.d;
            var roundness = diff/maxpair.d;
            return {
                // measure roundness, 0 = round, 1 = not
                roundness: roundness,
                mins: _.map(_.uniq(minpair.nodes), function(i) {return reg[i];}),
                maxs: _.map(_.uniq(maxpair.nodes), function(i) {return reg[i];})
            }
        }
        // if reg has only one node
        else {
            return {
                roundness: 0,
                mins: reg,
                maxs: reg
            }
        }
    };


    // continents
    var cont = require('./srcdata/continents.json');
    // helper, compute fraction of continent owned
    function continentFrac(node) {
        var allyNum = 0;
        var owner = node.owner;
        var icont = node.continent;
        var contclist = cont[icont];
        _.each(contclist, function(n) {
            if (g.nodes[n].owner == owner) allyNum++;
        })
        return allyNum / contclist.length;
    };


    


} //helper ends

exports.Graph = Graph;
// exports.regions = regions;
// exports.dist = dist;
exports.helper = helper;
