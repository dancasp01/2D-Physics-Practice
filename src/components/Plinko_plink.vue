<template>
    <div class="options">
      <button class="addBall" @click="addBall" :disabled="!addBall">Add ball</button>
      <label for="range">Ball value: {{ ballValue }}</label>
      <input class="range" name="range" type="range" step="20" min="1" max="201" v-model="ballValue">
      <p class="allBalls">Current balls: {{ allBalls.length }}</p>
      <h2 class="money" :class="{
        'red': money < startingValue,
        'green': money >= startingValue
      }">Money: ${{ money }}</h2>
    </div>
</template>

<script setup lang="js">
import Matter from 'matter-js';
import { ref } from 'vue';

const money = ref(2000);
const startingValue = money.value;
const ballValue = ref(20);

var allBalls = [];
// -------------------Ball Class---------------------------

class Ball {
    constructor(x, y,r) {
        var options = {
            restitution: .3,
            isStatic: false,
            friction: .05,
        }
        this.body = Bodies.circle(x, y, r, options);
        this.r = r;
    }
}

//---------------Matter Setup-------------------------------

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();
var world = engine.world;

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1000,
        height: 850,
        wireframes: false
    }
});

//create a starting funnel
var funnelLeft = new Bodies.rectangle(430, 45, 100, 20, {
    isStatic: true,
    angle: 0.7,
    render: {
        fillStyle: 'blue',
        strokeStyle: 'black',
    }
});

var funnelRight = new Bodies.rectangle(550, 45, 100, 20, {
    isStatic: true,
    angle: -0.7,
    render: {
        fillStyle: 'blue',
        strokeStyle: 'black',
    }
});

Composite.add(world, [funnelLeft,funnelRight]);

// Button to add a ball
function addBall() {
  if (money.value <= 0 || allBalls.length >= 30){
    return true;
  }
    let random = Math.floor(Math.random() * 100);
    var ball = new Ball(450 + random, 0, 10, 'red');
    money.value -= ballValue.value;
    if (ballValue.value > money.value) {
        ballValue.value = money.value;
    }
    console.log(money)
    Composite.add(world, [ball.body]);
    allBalls.push(ball);
}

var rows = 13;
var cols = 30;

var spacing = innerWidth/cols - 10;

//plinko board is taken from the matter.js tutorial they have
//not trying to reinvent the wheel

for (var j = -1; j < rows; j++) {
    for (var i = 0; i < cols; i++) {
      var x = i * spacing;
      if (j % 2 == 0) {
        x += spacing / 2;
        if(i == 2) x -= 3;
        if(i == cols - 3) x += 3;
      }
      var y = 2 * spacing + j * spacing + 80
      var peg = new Bodies.circle(x, y, 8, { isStatic: true,
        render: {
          fillStyle: 'white',
          strokeStyle: 'black',
        }
       });
      Composite.add(world, [peg]);
    }
  }



// adding the bottom multipliers
var lowMultiplier = new Bodies.rectangle(500, 800, 460, 20, {
    isStatic: true,
    render: {
        fillStyle: 'orange',
        strokeStyle: 'black',
    }
});

var leftHighMultiplier = new Bodies.rectangle(70, 800, 400, 20, {
    isStatic: true,
    render: {
        fillStyle: 'green',
        strokeStyle: 'black',
    }
});

var rightHighMultiplier = new Bodies.rectangle(930, 800, 400, 20, {
    isStatic: true,
    render: {
        fillStyle: 'green',
        strokeStyle: 'black',
    }
});

Composite.add(world, [lowMultiplier]);
Composite.add(world, [leftHighMultiplier]);
Composite.add(world, [rightHighMultiplier]);

//collison detection is from chat gpt -- it doesnt need to be good for right now it just needs to work
// will fix later once I am better with matter

// for low multiplier
Matter.Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;

    pairs.forEach(function(pair) {
        var bodyA = pair.bodyA;
        var bodyB = pair.bodyB;

        // Check if either bodyA or bodyB is a ball and the other is the low multiplier
        if ((bodyA === lowMultiplier && allBalls.some(ball => ball.body === bodyB)) ||
            (bodyB === lowMultiplier && allBalls.some(ball => ball.body === bodyA))) {
            
            // Find the ball that is involved in the collision
            let ballBody = bodyA === lowMultiplier ? bodyB : bodyA;

            // Remove the ball from the world
            Composite.remove(world, ballBody);

            // remove the ball from the allBalls array
            allBalls = allBalls.filter(ball => ball.body !== ballBody);
            money.value += Math.ceil(ballValue.value * .2);
        }
    });
});


//for left high multiplier
Matter.Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;

    pairs.forEach(function(pair) {
        var bodyA = pair.bodyA;
        var bodyB = pair.bodyB;

        // Check if either bodyA or bodyB is a ball and the other is the high multiplier
        if ((bodyA === leftHighMultiplier && allBalls.some(ball => ball.body === bodyB)) ||
            (bodyB === leftHighMultiplier && allBalls.some(ball => ball.body === bodyA))) {
            
            // Find the ball that is involved in the collision
            let ballBody = bodyA === leftHighMultiplier ? bodyB : bodyA;

            // Remove the ball from the world
            Composite.remove(world, ballBody);

            // Also remove the ball from the allBalls array

            allBalls = allBalls.filter(ball => ball.body !== ballBody);
            money.value += Math.ceil(ballValue.value * 2);
        }
    });
});

//for right high multiplier
Matter.Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;

    pairs.forEach(function(pair) {
        var bodyA = pair.bodyA;
        var bodyB = pair.bodyB;

        // Check if either bodyA or bodyB is a ball and the other is the high multiplier
        if ((bodyA === rightHighMultiplier && allBalls.some(ball => ball.body === bodyB)) ||
            (bodyB === rightHighMultiplier && allBalls.some(ball => ball.body === bodyA))) {
            
            // Find the ball that is involved in the collision
            let ballBody = bodyA === rightHighMultiplier ? bodyB : bodyA;

            //remove the ball from the game baord
            Composite.remove(world, ballBody);

            //remove the ball from the allBalls array
            allBalls = allBalls.filter(ball => ball.body !== ballBody);
            money.value += Math.ceil(ballValue.value * 2);
        }
    });
});


// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

</script>

<style>
.options {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
}
.addBall, .range, .allBalls, .money {
  display: block;
  outline-color: black;
  border: 2px solid black;
  padding: 10px;
  margin: 10px;
}
.red {
  color: red;
}
.green {
  color: green;
}
</style>