/**
 * @class NestPiece
 * @classdesc Represents a single piece of the nest
 * @param {integer} id - A unique identifier
 * @param {x : number, y : number} coord - The coordinate of the piece
 * @param {Nest object} nest - The parent nest class which controls the nest piece
 */
var NestPiece = function (id, coord, nest) {
    /**
     * @property {width : number, height : number} this.size - The size the
     *              piece will be in pixels
     * @property {x : number, y : number} this.coord - The coordinate of the piece
     * @property {Nest object} this.nest - The parent nest class which controls
     *              the nest piece
     * @property {integer} this.id - A unique identifier
     * @property {integer} this.type - The type of object the piece is. As the
     *              nest piece is essentially treated as a static ant and
     *              stored under ant in MAP, the type is needed so ants
     *              can identify the piece
     * @property {number} this.health - The health the piece has
     */

    this.size = CELL_SIZE;
    this.coord = coord;
    this.nest = nest;
    this.id = id;
    this.type = ANT_TYPE.nest;
    this.health = this.nest.health;
};

/**
 * Adds the piece to the map
 */
NestPiece.prototype.addToMap = function () {
    if (this.nest.alive) 
        MAP[coordToIndex(this.coord)].ant.push(this);
};

/**
 * Removes the piece from the map
 */
NestPiece.prototype.removeFromMap = function () {
    var index = MAP[coordToIndex(this.coord)].ant.indexOf(this);
    MAP[coordToIndex(this.coord)].ant.splice(index, 1);
};

/**
 * Removes the piece from the map
 */
NestPiece.prototype.die = function () {
    var index = this.nest.pieces.indexOf(this);
    this.nest.pieces.splice(index, 1);

    if (this.nest.pieces.length <= 0) {
        this.nest.die();
    }
};

/**
 * Draws the piece onto the canvas context
 * @param {canvas context 2d} ctx - The context which the piece will be drawn onto
 */
NestPiece.prototype.draw = function (ctx) {
    drawRect(ctx, scaleCoord(this.coord), this.size, this.nest.species.colour.nest);
};