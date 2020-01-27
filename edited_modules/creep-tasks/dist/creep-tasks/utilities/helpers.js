"use strict";
// Universal reference properties
Object.defineProperty(exports, "__esModule", { value: true });
function deref(ref) {
    return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
}
exports.deref = deref;
function derefRoomPosition(protoPos) {
    return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
}
exports.derefRoomPosition = derefRoomPosition;
function isEnergyStructure(structure) {
    return structure.energy != undefined && structure.energyCapacity != undefined;
}
exports.isEnergyStructure = isEnergyStructure;
function isStoreStructure(structure) {
    return structure.store != undefined;
}
exports.isStoreStructure = isStoreStructure;
