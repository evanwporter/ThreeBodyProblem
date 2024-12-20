// by Albert Schueller, math prof at Whitman College
// license: creative commons, BY-SA
var canvas;
var balls;
var G; // gravitational constant
var ship;

function setup() {
  // put setup code here
  canvas = createCanvas(1024, 768);
  canvas.position(10, 10);
  canvas.parent("threebody");
  ellipseMode(RADIUS);
  balls = [];
  colors = [
    color(255, 0, 0, 100),
    color(0, 255, 0, 100),
    color(0, 0, 255),
    100,
  ];

  // Three balls
  var N = 3;
  var v = 0.5; // tangential speed
  var R = 100;

  for (var i = 0; i < N; i++) {
    b = new Ball(5, colors[i], 10);
    b.thrust = false;
    b.position.x = width / 2 + R * cos((i * 2 * PI) / N);
    b.position.y = height / 2 + R * sin((i * 2 * PI) / N);
    b.velocity.x = v * sin((i * 2 * PI) / N);
    b.velocity.y = -v * cos((i * 2 * PI) / N);
    balls.push(b);
  }

  // Gravitational constant
  G = 5;

  var text = createDiv(
    '<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png" /></a><br /><span xmlns:dct="http://purl.org/dc/terms/" href="http://purl.org/dc/dcmitype/InteractiveResource" property="dct:title" rel="dct:type">ThreeBody</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://carrot.whitman.edu" property="cc:attributionName" rel="cc:attributionURL">Albert Schueller</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.'
  );

  text.style("width", "600px");
  text.position(10, height + 10);
}

function draw() {
  stroke(0);
  fill(255, 255, 255, 10);
  rect(0, 0, width - 1, height - 1);
  for (var i = 0; i < balls.length; i++) {
    balls[i].display();
    balls[i].update();
  }
  // Update gravity for each ball.
  gravity(balls);
  //stroke(0,255,0);
  //noFill();
  //ellipse(width/2,height/2,100,100);
  //console.log("dir: " + balls[0].direction);
}

function mouseClicked() {
  b = new Ball(10, color(255, 0, 0), 25);
  b.setPosition(createVector(mouseX, mouseY));
  b.setVelocity(createVector(random(-0.5, 0.5), random(-0.5, 0.5)));
  balls.push(b);
}

// A class that represents balls with mass and that react to gravity.
class Ball {
  constructor(radius, color, mass) {
    // Initial time, time step
    this.t = 0;

    // Input parameters
    this.radius = radius;
    this.color = color;
    this.mass = mass;
    this.position = createVector(width / 2, height / 2);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
  }
  // Method to update position
  update() {
    // update velocity
    this.velocity.add(this.acceleration);
    // update position
    this.position.add(this.velocity);

    // Bounce checks.
    bounce = false;
    if (bounce) {
      // top wall collision
      if (this.position.y < this.radius) {
        this.position.y = 2 * this.radius - this.position.y;
        this.velocity.y *= -1;
      }

      // bottom wall collision
      if (this.position.y > height - this.radius) {
        this.position.y = 2 * (height - this.radius) - this.position.y;
        this.velocity.y *= -1;
      }

      // left wall collision
      if (this.position.x < this.radius) {
        this.position.x = 2 * this.radius - this.position.x;
        this.velocity.x *= -1;
      }

      // right wall collision
      if (this.position.x > width - this.radius) {
        this.position.x = 2 * (width - this.radius) - this.position.x;
        this.velocity.x *= -1;
      }
    }
  }
  // Method to display
  display() {
    fill(this.color);
    stroke(0);
    strokeWeight(1);
    noStroke();
    ellipse(this.position.x, this.position.y, this.radius, this.radius);
  }
  // Method to set position vector
  setPosition(newPosition) {
    this.position.set(newPosition.x, newPosition.y);
  }
  // Method to set velocity vector
  setVelocity(newVelocity) {
    this.velocity.set(newVelocity.x, newVelocity.y);
  }
}

// Apply gravity adjustments to acceleration vector depending on the
// locations and masses of all balls in the list.
function gravity(b) {
  for (var i = 0; i < b.length; i++) {
    var ball1 = b[i].position;
    var totalAccel = createVector(0, 0);
    for (var j = 0; j < b.length; j++) {
      // Skip itself.
      if (i == j) {
        continue;
      }
      // Compute displacement vector to second ball.
      var accel = p5.Vector.sub(b[j].position, ball1);
      // Length of displacement
      var r = accel.mag();
      if (r < b[i].radius + b[j].radius) {
        r = b[i].radius + b[j].radius;
      }
      // Scale by Gm2/r^3 to get acceleration vector.
      accel.mult((G * b[j].mass) / pow(r, 3));
      totalAccel.add(accel);
    }
    b[i].acceleration.set(totalAccel.x, totalAccel.y);
  }
}

// Define the Ship constructor
class Ship {
  constructor(radius, color, mass, dir = 0) {
    // Call the parent constructor, making sure (using Function#call)
    // that "this" is set correctly during the call
    Ball.call(this, radius, color, mass);

    // Initialize our Ship-specific properties, radians, 0 points east,
    // positive rotate clockwise from there
    this.direction = dir;
    this.thrust = false;
  }
  // Replace the "display" method
  display() {
    push();
    translate(this.position.x, this.position.y);
    this.direction = this.velocity.heading();
    rotate(this.direction);
    stroke(color(0, 0, 0));
    fill(this.color);
    triangle(10, 0, -10, 5, -10, -5);
    if (this.thrust) {
      noStroke();
      fill(color(255, 0, 0));
      triangle(-10, -2, -10, 2, -18, 0);
    }
    pop();
  }
}

// Create a Ship.prototype object that inherits from Ball.prototype.
// Note: A common error here is to use "new Ball()" to create the
// Ship.prototype. That's incorrect for several reasons, not least
// that we don't have anything to give Ball for the "firstName"
// argument. The correct place to call Ball is above, where we call
// it from Ship.
Ship.prototype = Object.create(Ball.prototype); // See note below

;



