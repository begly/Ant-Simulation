/**
*Todo:
* Pherhapes implament a memory of the 5 least effort foods arond an ant?  even if it is out of sight

* What if target moves/gets eaten while on way to target?  i.e. check target is still where it should be each tick

* Watch for functions which pass by referance e.g. when using this.varible

*	- Add dynamic canvas resizing
*	- Add support for IE (version the school uses)
*	- Create ant subclasses
*		+ solider
*			- functions:
*				+ attack
*				+ patrol
*			- properties:
*				+ damage rate
*	- Create map class
*		+ 2 levels of zoom
*		+ environments
*/

// File scope variables
var canvasDOM;
var canvasCTX;
var isDown = false;

// Represents what happens each tick
function tick() {
	console.log('--------- TICK ----------');
	var ST = new Date;
		
	clearCanvas(canvasCTX);
	
	// Update all of the species
	for (var i = 0; i < antsList.length; i++)
		antsList[i].update();
	
	drawBackground(canvasCTX)
	drawMap(canvasCTX);
	drawGrid(canvasCTX);
	
	//  Framerate system
	var ET = new Date;
	if (ET - ST > 0) {		// so not to console.log infinity if too high
		var fps = 1000 / (ET - ST);
		//console.log('FPS: ' + fps.toFixed(1));
	}
	setTimeout(tick, TICK_TIME);
}

// All drawing is done in a batch to improve performance [check this]
function drawMap(ctx) {
	for (var i = 0; i < NUM_OF_CELLS; i++) {		
		// Update pheromone concentrations (better place to put this is in a function)
		// However this loop is already running so for performance putting it in here
		
		var coord = indexToCoord(i);
		if (visible(coord)) {
			
			for (var k = 0; k < MAP[i].pheromone.length; k++) {
				var pheromone = MAP[i].pheromone[k];
				pheromone.update();
				pheromone.draw(ctx);
			}
			if (MAP[i].ant.length > 0) {
				for (var k = 0; k < MAP[i].ant.length; k++) {
					var ant = MAP[i].ant[k];
					ant.draw(ctx);
				}
			} else if (MAP[i].food !== void(0)) {		// Don't want to draw food ontop of ants
				var food = MAP[i].food;
				food.draw(ctx);
			}
		}
	}
}

window.onload = function() {

	// Get canvas DOM then canvas context
	canvasDOM = getDOM(CANVAS.name);
	canvasCTX = getCTX(canvasDOM);
	
	resizeElement(canvasDOM, CANVAS);
	
	window.onkeydown = function(e) {
		e = e || window.event;
		var charCode = e.keyCode || e.which;
		switch (charCode) {
			case LEFT_ARROW_KEY:		// Left arrow
				START_COORD.x += 15;
				break;
			case RIGHT_ARROW_KEY:		// Right arrow
				START_COORD.x -= 15;
				break;
			case UP_ARROW_KEY:		// Up arrow
				START_COORD.y += 15;
				break;
			case DOWN_ARROW_KEY:		// Down arrow
				START_COORD.y -= 15;
				break;
		}
	};
			
	// Create empty map
	createMap();
	
	// Create food system
	FOOD = new FoodSystem();
	FOOD.ctx = canvasCTX;
	FOOD.addRandFood({x: 40, y: 40}, 5);
	//FOOD.addRandFood({x: 140, y: 140}, 25);
	//FOOD.addRandFood({x: 20, y: 80}, 15);
	//FOOD.addRandFood({x: 230, y: 80}, 20);
	
	// Create a species
	var testSpecies = new Species(genID());
	testSpecies.chars.speed = 1;
	testSpecies.chars.eyesight = 5;
	testSpecies.chars.eyeAngle = Math.PI/2;	// only seems to work for pi i.e. 180 degs
	testSpecies.chars.pheromoneConcentration = 0.4;
	testSpecies.chars.antennaSize = 5;
	testSpecies.chars.antennaAngle = Math.PI/2;
	testSpecies.colour = {
		worker : '#1C1C1C',
		soldier : '#1C1C1C',
		queen : '#00FF00',
		nest : '#555555',
		pheromone : '#E8E5A3',
	};	
	
	// Add ants
	for (var i = 0; i < DEBUG_ANT_NUM; i++) {
		var x = randInt({min : 0, max : GRID_SIZE.x - 1});	// -1 as randInt is inclusive
		var y = randInt({min : 0, max : GRID_SIZE.y - 1});
		var a = new Queen(genID(), {x : x, y : y});
		a.addToMap();
		a.species = testSpecies;
		a.colour = testSpecies.colour.worker;
		antsList.push(a);
		a.sayHello();
	}
	
	tick();
};