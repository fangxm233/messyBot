// All structure prototypes

// General structure prototypes ========================================================================================

// import {MY_USERNAME} from '../~settings';

Object.defineProperty(Structure.prototype, 'isWalkable', {
	get() {
		return this.structureType == STRUCTURE_ROAD ||
			   this.structureType == STRUCTURE_CONTAINER ||
			   (this.structureType == STRUCTURE_RAMPART && (<StructureRampart>this.my ||
															<StructureRampart>this.isPublic));
	},
	configurable: true,
});

// Container prototypes ================================================================================================

Object.defineProperty(StructureContainer.prototype, 'energy', {
	get() {
		return this.store.energy;
	},
	configurable: true,
});

Object.defineProperty(StructureContainer.prototype, 'isFull', { // if this container-like object is full
	get() {
		return !this.store.getFreeCapacity();
	},
	configurable: true,
});
Object.defineProperty(StructureContainer.prototype, 'isEmpty', { // if this container-like object is empty
	get() {
		return !this.store.getUsedCapacity();
	},
	configurable: true,
});

// Controller prototypes ===============================================================================================

// Object.defineProperty(StructureController.prototype, 'reservedByMe', {
// 	get         : function() {
// 		return this.reservation && this.reservation.username == MY_USERNAME;
// 	},
// 	configurable: true,
// });

// Object.defineProperty(StructureController.prototype, 'signedByMe', {
// 	get         : function() {
// 		return this.sign && this.sign.text == Memory.settings.signature && Game.time - this.sign.time < 250000;
// 	},
// 	configurable: true,
// });

Object.defineProperty(StructureController.prototype, 'signedByScreeps', {
	get         : function() {
		return this.sign && this.sign.username == 'Screeps';
	},
	configurable: true,
});


// StructureController.prototype.needsReserving = function(reserveBuffer: number): boolean {
// 	return !this.reservation || (this.reservedByMe && this.reservation.ticksToEnd < reserveBuffer);
// };

// Extension prototypes ================================================================================================

Object.defineProperty(StructureExtension.prototype, 'isFull', { // if this container-like object is full
	get() {
		return this.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
	},
	configurable: true,
});

Object.defineProperty(StructureExtension.prototype, 'isEmpty', { // if this container-like object is empty
	get() {
		return this.energy == 0;
	},
	configurable: true,
});

// Link prototypes =====================================================================================================

Object.defineProperty(StructureLink.prototype, 'isFull', { // if this container-like object is full
	get() {
		return this.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
	},
	configurable: true,
});

Object.defineProperty(StructureLink.prototype, 'isEmpty', { // if this container-like object is empty
	get() {
		return this.energy == 0;
	},
	configurable: true,
});


// Nuker prototypes ====================================================================================================

// PowerSpawn prototypes ===============================================================================================

// Spawn prototypes ====================================================================================================

Object.defineProperty(StructureSpawn.prototype, 'isFull', { // if this container-like object is full
	get() {
		return this.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
	},
	configurable: true,
});

Object.defineProperty(StructureSpawn.prototype, 'isEmpty', { // if this container-like object is empty
	get() {
		return this.energy == 0;
	},
	configurable: true,
});

// Storage prototypes ==================================================================================================

Object.defineProperty(StructureStorage.prototype, 'energy', {
	get() {
		return this.store.energy;
	},
	configurable: true,
});

Object.defineProperty(StructureStorage.prototype, 'isFull', { // if this container-like object is full
	get() {
		return !this.store.getFreeCapacity();
	},
	configurable: true,
});

Object.defineProperty(StructureStorage.prototype, 'isEmpty', { // if this container-like object is empty
	get() {
		return !this.store.getUsedCapacity();
	},
	configurable: true,
});


// Terminal prototypes =================================================================================================

Object.defineProperty(StructureTerminal.prototype, 'energy', {
	get() {
		return this.store.energy;
	},
	configurable: true,
});

Object.defineProperty(StructureTerminal.prototype, 'isFull', { // if this container-like object is full
	get() {
		return !this.store.getFreeCapacity();
	},
	configurable: true,
});

Object.defineProperty(StructureTerminal.prototype, 'isEmpty', { // if this container-like object is empty
	get() {
		return !this.store.getUsedCapacity();
	},
	configurable: true,
});

// StructureTerminal.prototype._send = StructureTerminal.prototype.send;
// StructureTerminal.prototype.send = function(resourceType: ResourceConstant, amount: number, destination: string,
// 											description?: string): ScreepsReturnCode {
// 	// Log stats
// 	let origin = this.room.name;
// 	let response = this._send(resourceType, amount, destination, description);
// 	if (response == OK) {
// 		TerminalNetwork.logTransfer(resourceType,amount,origin, destination)
// 	}
// 	return response;
// };

// Tower prototypes

Object.defineProperty(StructureTower.prototype, 'isFull', { // if this container-like object is full
	get() {
		return this.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
	},
	configurable: true,
});

Object.defineProperty(StructureTower.prototype, 'isEmpty', { // if this container-like object is empty
	get() {
		return this.energy == 0;
	},
	configurable: true,
});

// Tombstone prototypes ================================================================================================
Object.defineProperty(Tombstone.prototype, 'energy', {
	get() {
		return this.store.energy;
	},
	configurable: true,
});

// Rampart prototypes ================================================================================================
Object.defineProperty(StructureRampart.prototype, 'targetHits', {
	get() {
		if(!this._targetHits) {
			if(this.pos.inRangeTo(this.room.controller, 1)) return this._targetHits = 1e8;
			let nukes = (this as StructureRampart).room.find(FIND_NUKES);
			if(nukes.length) {
				let hits = 0;
				nukes.forEach(nuke => {
					if(nuke.pos.inRangeTo(this.pos, 0)) hits += 1e7;
					else if(nuke.pos.inRangeTo(this.pos, 2)) hits += 5e6;
				})
				if(hits) return this._targetHits = hits;
			}

			let hasRange = this.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: creep => !!creep.bodyCounts[RANGED_ATTACK]} );
			let hasMelee = this.pos.findInRange(FIND_HOSTILE_CREEPS, 3, { filter: creep => !!creep.bodyCounts[ATTACK] || !!creep.bodyCounts[WORK]} );
			if(hasRange.length || hasMelee.length) return this._targetHits = 2e7;
			else return this._targetHits = 3e6;
		}
		return this._targetHits;
	},
	configurable: true,
});
