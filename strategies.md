# Strategies for Risk game
Here we sketch our strategies we use to implement our AI for playing the Risk game.

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

##### 1. Shape and radius
The shape of a region is vital for defense and army mobility during fortification. 

This is the classic problem of minimizing the surface/volume ratio, or in this lower dimensional case, the perimeter/surface ratio.

Intuitively, a thin region is vulnerable, and has bad army mobility.
A thick, concentric shape is stronger. The average distance between nodes is also shorter and thus aids mobility.

Scan the entire graph (map) for connected subgraphs consisting of nodes owned by you, call each of these a *region*. 

For a subgraph *region*, identify its border nodes, i.e. nodes adjacent to at least a foreign node. For a pair of border nodes, the **radius** of the graph between them is the shortest distance between them. Of `n(n-1)/2` possible radii, we can measure the **shape** of the region by taking the difference between its maximum and minimum radii, and set a percent variation for this difference, i.e. 

```
shape = max radius - min radius (error +- percent variation)
```


##### 2. Island
Is a region is an island, i.e. `region size < 3`, abandon and don't place armies there. It might be reclaimed later, or be engulfed by enemies. On the flip side, larger regions will require more armies.

When attacking, enemy islands will have weak AM scalars too, thus the AM captures that.


##### 3. Countering forces (AM vs purpose)

1. Prepare for attacking wanted target nodes, i.e. build up armies.
2. Prepare for attacking if enemy weakens at some nodes (either lose forces or relocate).
3. Prepare to defend against an (imminent/occured) invasion (when a node's AM scalar drops, i.e. enemy gathering up)
4. Defend when losing countries, (when your AM scalar drops) to prevent further loss of countries, or to reclaim.

Furthermore note that army placement shall be optimal, i.e. sufficient to defend or attack, judged by the AM scalars. There shall also be an ordered list of nodes being reinforced, based on its values and AM scalars (see below too).

Another thing to consider is that placement cannot be homogenous; i.e. it might be good to have extremes, some nodes can be sacrificed, and some reinforced fiercely. It may also be better to accumulate armies at every other border point than to spread out evenly.


Putting these all together, we have

### The Priority Algorithm
This is the internal algorithm for stage 1 and 3, i.e. it's used to form the ordered list of priority nodes to reinforce and fortify. The list decides the strategies use, such as defend-then-attack, or attack-then-defend, or some other variation.

From a player's perspective,
1. Enumerate regions, borders (nodes), attackable nodes. Shape of each region.
<!-- 2. Update pressure. -->
3. Eval. values of all nodes (enemy's for attacking, your's for defending).
1. Enumerate regions, their sizes and their border nodes; all attackable nodes, i.e. union of neighs of borders that aren't yours.
<!-- 2. Abandon islands, i.e. `region size < 3`. Do not consider their nodes for all steps below. -->
3. For each kept region, calculate the shape, i.e. radii-difference `max radius - min radius (error +- percent variation)`; identify the node-pair of min radius for future expansion.
4. Call the sub-algorithm from stage 2 for computing AMs scalars – update pressure.
5. Next we enumerate the sublists, of finite length (say 3), that will form a final priority list:
6. Attack wanted nodes: Call the sub-algorithm for choosing target in stage 2 to enumerate targets(includes step 1,2,3 above). For each target, choose its origin of attack by considering it's degree and original AM. Add the origin to the list, called `list-attack`.
7. Attack weakened nodes: See if any of your AM scalars increase, implying enemy weakens. Add these nodes from the steepest increase, and that are not neighbors to those already added to, `list-weaken`.
8. Defend against enemy build-up/attempted attack: Compare the new AM scalars to their previous values, enumerate from the border nodes that have the highest decrease, call it `list-threat`.
9. Defend when losing countries: compare your current list of nodes owned to the previous, and list those in the unabandoned regions. Call it `list-lost`.
10. Call the sub-algorithm from stage 2 for choosing attack targets. Form an ordered list of attack-targets by importance.



### The Placement Algorithm
After the priority list has been enumerated, we can use the information the decide army-placement. There are sub-algorithms to consider:

##### 1. Strategy Variations for the Priority List
With the four lists `list-attack`, `list-weaken`, `list-threat`, and `list-lost`, there is 4!=24 ways to order them to form the final `priority list` for army placement. Optionally, some AI can imit some of the lists, making it "attack-only" or "defend-only". For a priority list, reinforce meaningfully (for the AM to increase above threshold, or rival enemy army number) while still can.

##### 2. Placement given the priority list
Given a priority list of nodes to reinforce, we have the options of 
1. reinforcing *only* nodes in the list, or,
2. reinforcing first the nodes below some threshold AM scalar, then the nodes in the list while possible.

##### 3. Hold-back: Time-sensitive reinforcement
Given above strategies, we can choose to reserve armies given at each turn until a threshold for a massive release. The AI can be a steamroller, turtle, early-rusher etc, by varying the amount of armies can be released as a function of time.







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
This is different from placing new armies: it is moving armies existing on the board from a single territory into a single adjacent territory, and can be performed only once per turn. The aim is to fortify.

Idea: shift armies like how white blood cells react to infection: move to it, leaving vacuum behind, which further attracts those behind. The vacuum pressure is portrayed by the AM scalars.

General distribution pattern:
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
find an extreme pair, then balance.
Note the same algorithm can be called restrictively in post-attack fortification.

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





