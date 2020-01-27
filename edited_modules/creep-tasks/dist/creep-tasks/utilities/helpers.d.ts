/// <reference types="screeps" />
export declare function deref(ref: string): RoomObject | null;
export declare function derefRoomPosition(protoPos: protoPos): RoomPosition;
export interface EnergyStructure extends Structure {
    energy: number;
    energyCapacity: number;
}
export interface StoreStructure extends Structure {
    store: StoreDefinition;
    storeCapacity: number;
}
export declare function isEnergyStructure(structure: Structure): structure is EnergyStructure;
export declare function isStoreStructure(structure: Structure): structure is StoreStructure;
