// The basic graph class
//Modified from @author devenbhooshan

// Dependencies
var _ = require('underscore');

function Graph(){
	this.isWeighted=false;
	this.nodes=[];
	this.addNode=addNode;
	this.removeNode=removeNode;
	this.nodeExist=nodeExist;
	this.getAllNodes=getAllNodes;
	this.pathing=pathing;
	function addNode(Name){
		temp=new Node(Name);
		this.nodes.push(temp);
		return temp;
	}
	function removeNode(Name){
		
		index=this.nodes.indexOf(Name);
		if(index>-1){
			this.nodes.splice(index,1);
			len=this.nodes.length;

			for (var i = 0; i < len; i++) {
				if(this.nodes[i].adjList.indexOf(Name)>-1){
					this.nodes[i].adjList.slice(this.nodes[i].adjList.indexOf(Name));
					this.nodes[i].weight.slice(this.nodes[i].adjList.indexOf(Name));
				}
			}
		}
		
	}
	function nodeExist(Name){
		index=this.nodes.indexOf(Name);
		if(index>-1){
			return true;
		}
		return false;
	}

	function getAllNodes(){
		return this.nodes;
	}
	
	function pathing(src) {
		var mat = [];
		var count = 5;
		console.log(this.nodes[src]);

		
		into(src);
		return mat;
	}

	function into(foo) {
		// console.log("foo", this.nodes);
		console.log("foo", nodes);
		// _.each(this.nodes[foo].adjList, function(tar) {
		// 	mat.push([tar]);
		// 	count--;
		// 	if (count > 0) {
		// 		into(tar);
		// 	}
		// });
	}



}

function Node(Name){
	this.name=Name;
	this.adjList=[];
	this.weight=[];
	this.addEdge=addEdge;
	this.compare=compare;
	function addEdge(neighbour,weight){
		if (this.adjList.indexOf(neighbour) == -1) {
			// console.log(this.adjList.indexOf(neighbour));
			this.adjList.push(neighbour);
			this.weight.push(weight);
			// return this.adjList;
		};
	}
	
	function getAdjList(){
		return adjList;
	}
	function compare(node2){
		return this.weight-node2.weight;
	}

	// special fields for the game
	this.owner="none";
	// this.setOwner=setOwner;
	// function setOwner(ownerName) {
	// 	this.owner = ownerName;
	// }
	// army of the owner
	this.army=0;
	// this.addArmy=addArmy;
	// function addArmy(num) {
	// 	this.army += num;
	// }


}

exports.Graph = Graph;