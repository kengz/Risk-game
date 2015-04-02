// The graph class and graph methods

// Dependencies
var _ = require('underscore');

// INSERT:
// scan for region, disconnected subgraph, find min n max dist bet any pair of border points

// The graph class = world map
function Graph(){
	this.nodes=[];
	this.addNode=addNode;
	function addNode(Name){
		temp=new Node(Name);
		this.nodes.push(temp);
		return temp;
	}
}
// The node for graph. game = country index
function Node(Name){
	this.name=Name;
	this.adjList=[];
	this.addEdge=addEdge;
	function addEdge(neighbour){
		if (this.adjList.indexOf(neighbour) == -1)
			this.adjList.push(neighbour);
	}
	// fields for the game:
	// player owning this node
	this.owner="none";
	// number of owner's army on this node
	this.army=0;
}



// split player's countries into regions = connected subgraph, of the dynamic graph dg
function regionSplit(playercountries, dg) {
	// list of my regions
	var myregions = [];
	// my countries
	var mine = _.sortBy(playercountries);

	// function to find next of your connected region
	function enumNextRegion() {
		// add first base to new region
		var newreg = [mine[0]];
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
		var adj = dg.nodes[i].adjList;
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
		}
		else
			return [];
	}

	// call enum
	while (mine.length != 0) {
		enumNextRegion();
	}
	return myregions;
}


exports.Graph = Graph;
exports.regionSplit = regionSplit;