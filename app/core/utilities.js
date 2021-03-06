/**
 * Returns a random integer within a specific range
 * @param {min : integer, max : integer} range - The range inclusive
 * @return {integer}
 */
function randInt(range) {
    return Math.floor(Math.random() * (range.max - range.min + 1) + range.min);
}

/**
 * Returns a random float within a specific range
 * @param {min : number, max : number} range - The range inclusive
 * @return {number}
 */
function randFloat(range) {
    if (Math.random() < 0.5)
        var result = (1 - Math.random()) * (range.max - range.min) + range.min;
    else
        var result = (Math.random() * (range.max - range.min) + range.min);
    return result;
}

/**
 * Returns a random angle between 0 and 2PI radians
 * @return {number}
 */
function randDir() {
    return randFloat({
        min: 0,
        max: Math.PI * 2
    });
}

/**
 * Returns a random hex colour
 * @return {string}
 */
function randColour() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * Returns an angle in the range 0 to 2PI i.e. if dir = 4PI returns 2PI
 * @param {number} dir - The direction
 * @return {number}
 */
function validateDirection(dir) {
    return dir - Math.PI * 2 * Math.floor(dir / (Math.PI * 2));
}

/**
 * Picks a random property of a object literal
 * @param {object} obj - the object literal
 * @return {object}
 */
function randProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count) 
            result = prop;
    return result;
}

/**
 * Returns the shortest distance between two coordinates
 * @param {x : number, y : number} coord1, coord2 - The coordinates
 * @return {number}
 */
function distance(coord1, coord2) {
    // picks the minimum distance either wraping around the map or directly
    var x = Math.min(Math.abs(coord1.x - coord2.x), GRID_SIZE.width - Math.abs(coord1.x - coord2.x));
    var y = Math.min(Math.abs(coord1.y - coord2.y), GRID_SIZE.height - Math.abs(coord1.y - coord2.y));
    return Math.sqrt(x * x + y * y);
}
/**
 * Scale a coordinate to its location in pixels
 * @param {x : number, y : number} coord - The coordinate to scale
 * @return {x : number, y : number} - The scaled coordinate
 */
function scaleCoord(coord) {
    return {
        x: coord.x * CELL_SIZE.width + CANVAS_OFFSET.x,
        y: coord.y * CELL_SIZE.height + CANVAS_OFFSET.y
    };
}

/**
 * Converts a coordinate to a map index, it can be used with coordinates which
 * don't map exactly to a single index and will work out which cell the coordinate
 * lies in mostly.
 * @param {x : number, y : number} coord - The coordinate which will be converted
 * @return {integer} - The map index which the coordinate converts to
 */
function coordToIndex(coord) {
    var cellCoord = boundary({
        x: Math.round(coord.x),
        y: Math.round(coord.y)
    }, MAP_BOUNDARY);
    return cellCoord.x + cellCoord.y * GRID_SIZE.width;
}

/**
 * Converts a map index to a coordinate
 * @param {integer} index - The map index
 * @return {x : number, y : number} - The coordinate which the index converts to
 */
function indexToCoord(index) {
    // Translates linear position in map to (x, y) coordinates on grid
    var x = index - Math.floor(index / GRID_SIZE.width) * GRID_SIZE.height;
    var y = Math.floor(index / GRID_SIZE.width);
    return {
        x: x,
        y: y
    };
}

/**
 * Smiler to coordToIndex however returns the *neat* coordinate i.e. a coordinate
 * which maps exactly to a single map index by finding the cell which the
 * coordinate lies in mostly
 * @param {x : number, y : number} coord - The coordinate
 * @return {x : number, y : number} - The coordinate which maps exactly to a single map index
 */
function getCellCoord(coord) {
    return boundary({
        x: Math.floor(coord.x),
        y: Math.floor(coord.y)
    }, MAP_BOUNDARY);
}

/**
 * Returns the *warped* coordinate of a coordinate if it exceeds the map boundary.
 * As the map wraps around if an ant goes off one side it will appear on the other.
 * @param {x : number, y : number} coord - The coordinate to test
 * @param {x : {min : number, max : number}, y : {min : number, max : number}} bounds
 *          - The boundary which is tested against
 * @return {x : number, y : number} - The warped coordinate
 */
function boundary(coord, bounds) {

    // Check x bounds
    if (coord.x < bounds.x.min)
        coord.x = bounds.x.max - Math.abs(coord.x); // x may be negative if x < 0
    else if (coord.x >= bounds.x.max)
        coord.x = coord.x - bounds.x.max; // x cannot be negative unless boundary is

    // Check y bounds
    if (coord.y < bounds.y.min)
        coord.y = bounds.y.max - Math.abs(coord.y);
    else if (coord.y >= bounds.y.max)
        coord.y = coord.y - bounds.y.max;

    return coord;
}

/**
 * Returns an array of cells which lie a certain distance around a specific point
 * @param {x : number, y : number} coord - The coordinate to get the block around
 * @param {width : integer, height : integer} size - The size of the block i.e.
 *          if width = 2, takes 2 block to the left, and two blocks to the
 *          right of the coordinate
 * @return {[{x : number, y : number}]} - An array of coordinates which lie
 *          around the coordinate
 */
function getBlock(coord, size) {
    block = [];

    for (var y = coord.y - size.height; y <= coord.y + size.height; y++) {
        for (var x = coord.x - size.width; x <= coord.x + size.width; x++) {
            block.push(getCellCoord({
                x: x,
                y: y
            }));
        }
    }

    return block;
}

/**
 * Returns an array of cells which lie in the sector of a circle of a
 * particular radius around a specific point
 * @param {x : number, y : number} coord - The coordinate to get the block around
 * @param {integer} radius - The radius of the circle which a sector is being taken from
 * @param {number} direction - The direction the ant is facing
 * @param {number} angle - The angle of the sector
 * @return {[{x : number, y : number}]} - An array of coordinates which lie in the sector
 */
function getSector(coord, radius, direction, angle) {

    var block = [];

    for (var y = coord.y - radius; y <= coord.y + radius; y++) {
        for (var x = coord.x - radius; x <= coord.x + radius; x++) {

            var searchCoord = {
                x: x,
                y: y
            };

            var validDir = validateDirection(direction);
            var theta = validateDirection(angleTo(coord, searchCoord));
            var dist = distance(coord, searchCoord);

            var minSector = validateDirection(direction - angle / 2);
            var maxSector = validateDirection(direction + angle / 2);

            // Determine if the coordinate lies in the sector
            if (theta >= minSector && theta <= maxSector && dist <= radius) {
                block.push(getCellCoord(searchCoord));
            } else if ((validDir <= angle / 2 || validDir >= Math.PI * 2 - angle / 2) &&
                (theta <= maxSector || theta >= minSector) && dist <= radius) {
                block.push(getCellCoord(searchCoord));
            }
        }
    }

    return block;
}

/**
 * Returns the reverse direction i.e. + PI radians
 * @param {number} angle - The angle in radians
 * @return {number}
 */
function turnAround(angle) {
    return angle + Math.PI;
}

/**
 * Returns the direction/angle of shortest path to get from the coord to the target
 * @param {x : number, y : number} coord, target - The coordinates
 * @return {number} - The angel from the vertical axis clockwise in radians
 */
function angleTo(coord, target) {
    // Find the minimum distance and go in that direction i.e. either 
    // directly to target or warping around map
    if (GRID_SIZE.width - Math.abs(target.x - coord.x) > Math.abs(target.x - coord.x)) {
        var dx = target.x - coord.x;
    } else {
        var dx = GRID_SIZE.width - (target.x - coord.x);
    }

    if (GRID_SIZE.height - Math.abs(target.y - coord.y) > Math.abs(target.y - coord.y)) {
        var dy = target.y - coord.y;
    } else {
        var dy = GRID_SIZE.height - (target.y - coord.y);
    }

    return Math.atan2(dy, dx) + Math.PI / 2; // atan2 find the angle from the horizontal 
    // however ants use angle from the vertical
}

/**
 * Creates a new ant
 * @param {Species object} species - The species of the new ant
 * @param {x : number, y : number} coord - The coordinate of the new ant
 * @param {Nest object} nest - The new ants home nest (the nest which it delivers food to)
 * @param {number} startingHealth - The new ants health
 * @param {integer} type - The type of ant to create i.e. ANT_TYPE.worker
 */
function createAnt(species, coord, nest, startingHealth, type) {

    switch (type) {
    case ANT_TYPE.worker:
        var ant = new Worker(genID(), coord);
        ant.colour = species.colour.worker;
        break;

    case ANT_TYPE.queen:
        var ant = new Queen(genID(), coord);
        ant.colour = species.colour.queen;
        break;

    case ANT_TYPE.soldier:
        var ant = new Soldier(genID(), coord);
        ant.colour = species.colour.soldier;
        break;
    }

    // Only possible to mutate queens (due to the nature of ant reproduction)
    if (type === ANT_TYPE.queen) {
        ant.species = species.mutate();
    } else {
        ant.species = species;
    }

    ant.nest = nest;
    ant.species.ants.push(ant);

    ant.health = startingHealth;

    ANTS_LIST.push(ant);
    ant.addToMap();
}

/**
 * Generates a unique id. Requires CURRENT_ID variable to keep track of current id
 * @return {integer} - A unique ID
 */
function genID() {
    CURRENT_ID += 1;
    return CURRENT_ID;
}

/**
 * Clones a object needed as JavaScript passes everything by reference
 * @param {object} obj - The object which will be cloned
 * @return {object} - A copy of object
 *
 * Credit:
 * http://stackoverflow.com/questions/7574054/javascript-how-to-pass-object-by-value
 */
function clone(obj) {
    if (obj === null || typeof (obj) !== 'object') return obj;

    var temp = new obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);

    return temp;
}

/**
 * Returns the html element an ID responds to
 * @param {string} id - HTML id
 * @return {HTML element} - The HTML element
 */
function getElement(id) {
    return document.getElementById(id);
}

/**
 * Sets the value of a html element
 * @param {string} id - HTML id
 * @param {string} value
 */
function setValue(id, value) {
    document.getElementById(id).value = value;
}