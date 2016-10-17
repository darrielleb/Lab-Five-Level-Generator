function Level(plan) {
  this.width = plan[0].length;

  this.height = plan.length;

  this.grid = [];

  for (var y = 0; y < this.height; y++) {
    var line = plan[y], gridLine = [];

    for (var x = 0; x < this.width; x++) {

      var ch = line[x], fieldType = null;

      if (ch == "x")
        fieldType = "wall";
      else if (ch == "!")
        fieldType = "lava";
      else if (ch="y");
      fieldType= "floater";

      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
}

function Vector(x, y) {
  this.x = x; this.y = y;
}

Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}

function DOMDisplay(parent, level) {

  this.wrap = parent.appendChild(elt("div", "game"));
  this.level = level;

  this.pos = new Vector(0, -0.5);
  this.speed = new Vector(0,0);

  this.wrap.appendChild(this.drawBackground());
}

var scale = 20;

DOMDisplay.prototype.drawBackground = function() {
  var table = elt("table", "background");
  table.style.width = this.level.width * scale + "px";

  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt("tr"));
    rowElt.style.height = scale + "px";
    row.forEach(function(type) {
      rowElt.appendChild(elt("td", type));
    });
  });
  return table;
};


var screenXSpeed = 100;
var screenYSpeed = 100;

DOMDisplay.prototype.scrollView = function(keys, step) {
  var width = this.wrap.clientWidth;
  var maxWidth = this.wrap.scrollWidth;
  var height = this.wrap.clientHeight;
  var maxHeight = this.wrap.scrollHeight;


  this.speed.x = 0;
  if (keys.left && this.pos.x > 0) this.speed.x -= screenXSpeed;
  if (keys.right && (this.pos.x < (maxWidth-width))) this.speed.x += screenXSpeed;

  this.speed.y = 0;
  if (keys.up && this.pos.y > 0) this.speed.y -= screenYSpeed;
  if (keys.down && (this.pos.y < (maxHeight-height))) this.speed.y += screenYSpeed;

  var motion = new Vector(this.speed.x * step, this.speed.y * step);
  var newPos = this.pos.plus(motion);

  this.wrap.scrollLeft = newPos.x;
  this.wrap.scrollTop = newPos.y;

  this.pos = newPos;
};

var arrowCodes = {37: "left", 38: "up", 39: "right", 40: "down"};

function trackKeys(codes) {
  var pressed = Object.create(null);


  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

var arrows = trackKeys(arrowCodes);

function runLevel(level, Display) {
  var display = new Display(document.body, level);

  runAnimation(function(step) {
    display.scrollView(arrows,step);
  });
}

function runGame(plans, Display) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display);
  }
  startLevel(0);
}