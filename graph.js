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
    // pressure from AM matrix
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

    // the dynamic graph for use below
    var g = dg;

    // split player's countries into regions = connected subgraph, of the dynamic graph dg
    function regions(player) {
        // list of my regions
        var myregions = [];
        // my countries
        var mine = _.sortBy(player.countries);

        // function to find next of your connected region
        function enumNextRegion(srcnode) {
            // add first base to new region
            var newreg = [srcnode];
            // then remove first from nodes
            mine = _.rest(mine);
            // new region found, add
            newreg = _.union(newreg, myconnected(newreg[0]));
            myregions.push(newreg);
            // update mine
            mine = _.difference(mine, newreg);
        }

        // my nodes that are already checked
        var checked = [];
        // get my nodes that are connected
        function myconnected(i) {
            // get neigh of i
            var adj = g.nodes[i].adjList;
            // adjacent of i that are mine:
            // move out: exclude checked nodes
            var neighmine = _.difference(_.intersection(adj, mine), checked);
            // then update, mark neigh as checked
            checked = _.union(checked, neighmine);
            // if found any adj nodes that're mine
            if (neighmine.length != 0) {
                // call for each of neighmine, then join
                return _.uniq(
                    _.flatten(
                        neighmine,
                        _.map(neighmine, myconnected)
                        )
                    );
            } else
            return [];
        }

        // call enum
        while (mine.length != 0) {
            enumNextRegion(mine[0]);
        }
        return myregions;
    };

    // enum the border nodes of a player
    function borders(player) {
        var bnodes = [];
        _.each(player.countries, function(n) {
            // find the first neigh that
            var enemy = _.find(g.nodes[n].adjList, function(i) {
                // belongs to a different owner
                return g.nodes[i].owner != player.name;
            })
            // if found enemy in adj
            if (enemy != undefined) {
                bnodes.push(n);
            }
        })
        return bnodes;
    };

    // all the attackable nodes from player's borders
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
                        minpair.nodes = [i, j];
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
            var round = diff/maxpair.d;
            return {
                // measure roundness, 0 = round, 1 = not
                round: round,
                mins: minpair.nodes,
                maxs: maxpair.nodes
            }
        }
        // if reg has only one node
        else {
            return {
                round: 0,
                mins: [reg[0]],
                maxs: [reg[0]]
            }
        }
    };

    


} //helper ends

exports.Graph = Graph;
// exports.regions = regions;
// exports.dist = dist;
exports.helper = helper;
