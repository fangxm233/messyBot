Object.defineProperty(ConstructionSite.prototype, 'isWalkable', {
	get() {
		return this.structureType == STRUCTURE_ROAD ||
			   this.structureType == STRUCTURE_CONTAINER ||
			   (this.structureType == STRUCTURE_RAMPART && (<StructureRampart>this.my ||
															<StructureRampart>this.isPublic));
	},
	configurable: true,
});