// Type guards library: this allows for instanceof - like behavior for much lower CPU cost. Each type guard
// differentiates an ambiguous input by recognizing one or more unique properties.

export interface EnergyStructure extends Structure {
	energy: number;
	energyCapacity: number;
}

export interface StoreStructure extends Structure {
	store: StoreDefinition;
	storeCapacity: number;
}

export interface DecayStructure extends Structure {
	ticksToDecay: number;
}

// export function isEnergyStructure(obj: RoomObject): obj is EnergyStructure {
// 	return (<EnergyStructure>obj).energy != undefined && (<EnergyStructure>obj).energyCapacity != undefined;
// }

export function isStoreStructure(obj: RoomObject): obj is StoreStructure {
	return (<StoreStructure>obj).store != undefined;
}

export function isStructure(obj: RoomObject): obj is Structure {
	return (<Structure>obj).structureType != undefined;
}

export function isOwnedStructure(structure: Structure): structure is OwnedStructure {
	return (<OwnedStructure>structure).owner != undefined;
}

export function isSource(obj: Source | Mineral): obj is Source {
	return (<Source>obj).energy != undefined;
}

export function isTombstone(obj: RoomObject): obj is Tombstone {
	return (<Tombstone>obj).deathTime != undefined;
}

export function isDecayStructure(obj: RoomObject): obj is DecayStructure {
	return (<DecayStructure>obj).ticksToDecay != undefined;
}

export function isResource(obj: RoomObject): obj is Resource {
	return (<Resource>obj).amount != undefined;
}

export function hasPos(obj: HasPos | RoomPosition): obj is HasPos {
	return (<HasPos>obj).pos != undefined;
}

export function isRuin(obj: RoomObject): obj is Ruin {
	return (<Ruin>obj).destroyTime != undefined;
}

export function isCreep(obj: RoomObject): obj is Creep {
	return (<Creep>obj).fatigue != undefined;
}

export function isPowerCreep(obj: RoomObject): obj is PowerCreep {
	return (<PowerCreep>obj).powers != undefined;
}

export function isPowerEffect(obj: RoomObjectEffect): obj is PowerEffect{
	return (<PowerEffect>obj).power != undefined;
}