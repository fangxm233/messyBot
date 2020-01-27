RoomPosition.prototype.getMultiRoomRangeTo = function(pos: RoomPosition): number {
	// if (this.roomName == pos.roomName) {
	// 	return this.getRangeTo(pos);
	// } else {
		const from = this.roomCoords;
		const to = pos.roomCoords;
		const dx = Math.abs(50 * (to.x - from.x) + pos.x - this.x);
		const dy = Math.abs(50 * (to.y - from.y) + pos.y - this.y);
		return Math.max(dx, dy) - (1 / (Math.min(dx, dy) + 1.1)) + 1;
	// }
};

RoomPosition.prototype.getSqrtRoomRangeTo = function(pos: RoomPosition): number {
	if (this.roomName == pos.roomName) {
		return 0;
	} else {
		const from = this.roomCoords;
		const to = pos.roomCoords;
		const dx = Math.abs(to.x - from.x);
		const dy = Math.abs(to.y - from.y);
		return Math.sqrt(dx * dx + dy * dy);
	}
};

RoomPosition.prototype.getRoomRangeTo = function(pos: RoomPosition): number {
	if (this.roomName == pos.roomName) {
		return 0;
	} else {
		const from = this.roomCoords;
		const to = pos.roomCoords;
		const dx = Math.abs(to.x - from.x);
		const dy = Math.abs(to.y - from.y);
		return Math.max(dx, dy);
	}
};

RoomPosition.prototype.findClosestByMultiRoomRange = function <T extends _HasRoomPosition>(objects: T[]):
	T | undefined {
	return minBy(objects, (obj: T) => this.getMultiRoomRangeTo(obj.pos));
}; 

RoomPosition.prototype.isWalkable = function(ignoreCreeps = false, ignoreStructures = false): boolean {
	// Is terrain passable?
	if (Game.map.getRoomTerrain(this.roomName).get(this.x, this.y) == TERRAIN_MASK_WALL) return false;
	if (this.isVisible) {
		// Are there creeps?
		if (ignoreCreeps == false && this.lookFor(LOOK_CREEPS).length > 0) return false;
		// Are there structures?
		if (ignoreStructures == false && _.filter(this.lookFor(LOOK_STRUCTURES), (s: Structure) => !s.isWalkable).length > 0) return false;
		// Are there unwalkable constructionSites?
		if(ignoreStructures == false && _.filter(this.lookFor(LOOK_CONSTRUCTION_SITES), (site: ConstructionSite) => !site.isWalkable).length > 0) return false;
	}
	return true;
};

RoomPosition.prototype.availableNeighbors = function(ignoreCreeps = false, ignoreStructures = false): RoomPosition[] {
	return _.filter(this.neighbors, pos => pos.isWalkable(ignoreCreeps, ignoreStructures));
};

Object.defineProperty(RoomPosition.prototype, 'roomCoords', {
	get         : function() {
		const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.roomName);
		let x = parseInt(parsed![1], 10);
		let y = parseInt(parsed![2], 10);
		if (this.roomName.includes('W')) x = -x;
		if (this.roomName.includes('N')) y = -y;
		return {x: x, y: y} as Coord;
	},
	configurable: true,
});

Object.defineProperty(RoomPosition.prototype, 'isVisible', { // if the position is in a defined room
	get         : function() {
		return Game.rooms[this.roomName] != undefined;
	},
	configurable: true,
});

// if(!RoomPosition.prototype.neighbors)
// 	Object.defineProperty(RoomPosition.prototype, 'neighbors', {
// 		get: function () {
// 			let adjPos: RoomPosition[] = [];
// 			for (let dx of [-1, 0, 1]) {
// 				for (let dy of [-1, 0, 1]) {
// 					if (!(dx == 0 && dy == 0)) {
// 						let x = this.x + dx;
// 						let y = this.y + dy;
// 						if (0 < x && x < 49 && 0 < y && y < 49) {
// 							adjPos.push(new RoomPosition(x, y, this.roomName));
// 						}
// 					}
// 				}
// 			}
// 			return adjPos;
// 		}
// 	});

RoomPosition.prototype.lookForStructure = function(structureType: StructureConstant): Structure | undefined {
	return _.find(this.lookFor(LOOK_STRUCTURES), s => s.structureType === structureType);
};

function minBy<T>(objects: T[], iteratee: ((obj: T) => number | false)): T | undefined {
	let minObj: T | undefined;
	let minVal = Infinity;
	let val: number | false;
	for (const i in objects) {
		val = iteratee(objects[i]);
		if (val !== false && val < minVal) {
			minVal = val;
			minObj = objects[i];
		}
	}
	return minObj;
}