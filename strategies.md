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
6. (Advanced) Pattern of enemy expansion


## Stage 1: Getting and Placing New Armies

Distribution for Shape
Defend
Buildup, preparing for attack.

## Stage 2: The Attack-Algorithm
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
Different from placing new armies: is moving armies existing on the board from a single territory into a single adjacent territory.
1. Defend
To counter enemy influence (shift to where enemy AM is strong)
2. Attack
Shift to where enemy AM is weak
accumulation in a single territory:

Distribution pattern:
Center-weak/frontline-strong.

1. Shifting for troop distribution based on the shape of your owned region.

1. Center-out: 

#### Sketch of factors:
degree of node
ease of reinforcing
AM
accumulation of army
