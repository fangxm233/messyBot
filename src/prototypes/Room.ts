Object.defineProperty(Room.prototype, 'coord', {
	get         : function() {
		const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.name);
		let x = parseInt(parsed![1], 10);
		let y = parseInt(parsed![2], 10);
		if (this.name.includes('W')) x = -x;
		if (this.name.includes('N')) y = -y;
		return {x: x, y: y} as Coord;
	},
	configurable: true,
});

Object.defineProperty(Room.prototype, 'isFull', {
	get         : function() {
		return this.energyAvailable == this.energyCapacityAvailable;
	},
	configurable: true,
});

Object.defineProperty(Room.prototype, 'isNearByHighway', {
	get         : function() {
		return this.coord.x % 10 == 1 || this.coord.x % 10 == 9 || this.coord.y % 10 == 1 || this.coord.y == 9;
	},
	configurable: true,
});