import { Role } from "./role";
import { profile } from "../profiler/decorator";

@profile
export class RoleDismantler extends Role {
    run() {
        if (!Memory.gotoDismantle || !Game.flags['dismantle']) return;
        if (this.creep.hits < this.creep.hitsMax) Memory.gotoDismantle = false;
        let room = Game.flags['dismantle'].room;
        if (!room) {
            this.creep.travelTo(Game.flags['dismantle'], { preferHighway: true, allowHostile: true});
            return;
        }
        if (room.name != this.creep.room.name) {
            this.creep.travelTo(Game.flags['dismantle'], { preferHighway: true, allowHostile: true});
            return;
        }
        var targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                // return structure.structureType == STRUCTURE_RAMPART && !structure.my
                return structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTAINER 
                && structure.structureType != STRUCTURE_PORTAL && structure.structureType != STRUCTURE_CONTROLLER //&& !structure.my;
                // && structure.id != '5bbcafce9099fc012e63b379';
            }
        });
        var target = this.creep.pos.findClosestByRange(targets);
        // var target = Game.getObjectById<Structure>('5cdc5e55d020f43ea44962b6');
        // if (!target) target = Game.getObjectById('5cd5f81dac5d6f1e31c0f366');
        if (!target) {
            Memory.gotoDismantle = false;
            return;
        }
        if (this.creep.dismantle(target) == ERR_NOT_IN_RANGE) {
            this.creep.travelTo(target);
        }
    }
}