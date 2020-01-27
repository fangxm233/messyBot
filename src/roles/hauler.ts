import { Role } from "./role";
import Tasks from "creep-tasks";
import { isStoreStructure } from "../declarations/typeGuards";
import { profile } from "../profiler/decorator";

@profile
export class RoleHauler extends Role {
    run() {
        if (!Memory.gotoHaul || !Game.flags['haul']) return;
        if (this.creep.hits < this.creep.hitsMax) Memory.gotoHaul = false;
        let roomName = Game.flags['haul'].pos.roomName;
        if (roomName != this.creep.room.name && this.creep.store.getFreeCapacity() > 0) {
            this.creep.travelTo(Game.flags['haul']);
            return;
        }
        if (!this.creep.task) {
            if (this.creep.store.getFreeCapacity() > 0) {
                let target = this.creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => isStoreStructure(structure) && structure.store.getUsedCapacity() > 0 });
                if (target && isStoreStructure(target)) this.creep.task = Tasks.withdrawAll(target);
            } else {
                let storage = Game.getObjectById<StructureStorage | StructureContainer>(Memory.rooms[this.creep.memory.spawnRoom].storage);
                if (storage)
                this.creep.task = Tasks.transferAll(storage);
            }
        }
        if (this.creep.task && this.creep.task.isValid()) {
            this.creep.task.run();
            return;
        }
    }
}