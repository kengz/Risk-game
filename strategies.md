# Strategies to the Risk-game
Here we sketch our strategies we use to implement our AI for playing the Risk-game.

Each turn consists of three stages:
1. Getting and placing new armies;
2. Attacking, if you choose to, by rolling the dice; 
3. Fortifying your position.


#### Raw Data
1. The Army-Matrix (AM)
2. The Radius-Matrix (RM) for each node, via path-searching
3. Degree of each graph node
4. Shape of every player's territories, thus strong and weak spots
5. Fraction of continent owned
6. Pattern of enemy expansion by time-variation of AM scalars


## Stage 1: Getting and Placing New Armies

Primary factors in optimizing army placement:
1. Shape and radius (subgraph: `radii max - min > threshold`)
2. Island (abandon if region is an island)
3. Countering forces (AM, yours v.s. enemy's)

##### Shape and radius
The shape of a region is vital for defense and army mobility during fortification. 

This is the classic problem of minimizing the surface/volume ratio, or in this lower dimensional case, the perimeter/surface ratio.

Intuitively, a thin region is vulnerable, and has bad army mobility.
A thick, concentric shape is stronger. The average distance between nodes is also shorter and thus aids mobility.

Scan the entire graph (map) for connected subgraphs consisting of nodes owned by you, call each of these a *region*. 

For a subgraph *region*, identify its border nodes, i.e. nodes adjacent to at least a foreign node. For a pair of border nodes, the **radius** of the graph between them is the shortest distance between them. Of `n(n-1)/2` possible radii, we can measure the **shape** of the region by taking the difference between its maximum and minimum radii, and set a percent variation for this difference, i.e. 

```
shape = max radius - min radius (error +- percent variation)
```



##### Island
Is a region is an island, i.e. `region size < 3`, abandon and don't place armies there. It might be reclaimed later, or be engulfed by enemies. On the flip side, larger regions will require more armies.

When attacking, enemy islands will have weak AM scalars too, thus the AM captures that.


##### Countering forces (AM vs purpose)

1. Prepare for attacking wanted target nodes, i.e. build up armies.
2. Prepare for attacking if enemy weakens at some nodes (either lose forces or relocate).
3. Prepare to defend against an imminent invasion (when a node's AM scalar drops, i.e. enemy gathering up)
4. Defend when attacked, (when your AM scalar drops) to prevent further loss of countries, or to reclaim.

Furthermore note that army placement shall be optimal, i.e. sufficient to defend or attack, judged by the AM scalars. There shall also be an ordered list of nodes being reinforced, based on its values and AM scalars (see below too).

Another thing to consider is that placement cannot be homogenous; i.e. it might be good to have extremes, some nodes can be sacrificed, and some reinforced fiercely. It may also be better to accumulate armies at every other border point than to spread out evenly.


Putting these all together, we have

<!-- Modularize the listing algorithm, can sub for different strategies: defend first attack later, or vice versa -->
<!-- ###  -->

### The Placement Algorithm
<!-- Isolate the algorithm to create a list of importance  -->
<!-- this algorithm shall only have placement: optimal homogen then extra accumulation -->

1. Enumerate regions and border nodes
2. Abandon islands, `region size < 3`
3. Calculate the shape for each region kept, list the radii-difference `max radius - min radius (error +- percent variation)`, identify node-pair of min radius
4. Call the sub-algorithm from stage 2 for computing AMs.
5. Call the sub-algorithm from stage 2 for choosing attack targets.
Form an ordered list of attack-targets by importance.
6. Using information above, compute an ordered list of nodes to reinforce by importance. (Defend first, attack later. For nodes to defend, see the Fortifying algorithm 2. This list of attack targets is used there).
7. (Safety first, attack with excess) Calculate an optimal homogenous placement of armies (along borders), with a threshold minimum. While possible, accumulate (add) more armies at the important nodes listed above.



## Stage 2: Attacking

### The Attack Algorithm
```
1. Among the attackable countries, choose one you wish to attack.
2. See from where can you attack it.
3. Attack.
```

We further expand each one above:

#### 1. Choosing a target
1.1 Value: node degree. Does it increase your troop mobility?
1.2 Value: shape. Does it help optimize the shape of your connected territories?
1.3 Value: continent-completion? Is it one of the final piece needed to rule a continent?
1.4 Value: If owned, will it cause more threats or increase your dominance?
1.5 Ease: How weak is the target relative to how strong are you? Measure by target's AM(less negative) and your AM(more positive).
1.6 Purpose: to weaken or to capture target?

#### 2. Choosing an origin of attack
2.1 Chances of winning. List candidate-origins with sufficient/ideal AM v.s. target AM?
2.2 Maintain the balance of troop distribution w.r.t the shape of your territories. Number of sacrificeable armies?
2.3 If fail, fallback available? Ensure origin not weakened, i.e. has remaining troops and adjacent reinforcement.
2.4 If captured, ease of reinforcement/troop transfer.

#### 3. Attacking
3.1 AM: Number of dice to roll?
3.2 Decide the battle outcome.
3.3 If captured, number of troops to move in?
3.4 Attack more territories? Recurse the attack-algorithm.


## Stage 3: Fortifying
This is different from placing new armies: it is moving armies existing on the board from a single territory into a single adjacent territory, and can be performed only once per turn.

Idea: shift armies like how white blood cells react to infection: move to it, leaving vacuum behind, which further attracts those behind.

Distribution pattern:
Center-weak/frontline-strong.

Scan for border point with lowest AM scalar, move to it:
- the center of thin part will have lower AM, thus reinforced more.
- the center of thick part will have higher AM, thus can be cleared out.

Is a really slow part of the game since only one move. thus can be used in combining two huge forces, for use in:

1. Defending
To counter enemy influence (shift to where your AM is weak)
2. Attacking
Shift to where enemy AM is weak
accumulation in a single territory:



### The Fortifying Algorithm
1. Update the AM.

<!-- move all computation to above -->

2. (Safety first, attack with excess) Retrieve the unabandoned regions, out of their border nodes, rank them from the most negative scalar (needy) of reinforcement, if any of them exceeds a threshold.
3. Append the list of attack target from the Placement Algorithm to this list.
3. Starting from the first of the list, if there exists a neighbor that can give armies without compromising security, do it, recurse for the next node in list, and terminate when a fortification occurs.


#### Sketch of factors:
degree of node
ease of reinforcing
AM
accumulation of army





