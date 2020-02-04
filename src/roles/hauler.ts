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
        if(this.creep.store.getUsedCapacity() > 100) {
            if(roomName != this.creep.room.name) {
                this.creep.travelTo(Game.flags['haul'], {preferHighway: true});
                return;
            }
            let container = this.creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: creep => creep.name.match('container') && creep.store.getFreeCapacity()});
            if(container) {
                if(!this.creep.pos.inRangeTo(container, 1)) {
                    this.creep.travelTo(container);
                    return;
                } 
                this.creep.transfer(container, RESOURCE_OPS);
                return
            }
            return;
        }

        let storage = Game.rooms['W12N9'].storage;
        if(storage) {
            if(!this.creep.pos.isNearTo(storage)) this.creep.travelTo(storage);
            else this.creep.withdraw(storage, RESOURCE_OPS);
        }
    }
}
/*
export class RoleHauler extends Role {
    run() {
        if (!Memory.gotoHaul || !Game.flags['haul']) return;
        if (this.creep.hits < this.creep.hitsMax) Memory.gotoHaul = false;
        let roomName = Game.flags['haul'].pos.roomName;
        if(this.creep.store.getUsedCapacity() > 100) {
            if(roomName != this.creep.room.name) {
                this.creep.travelTo(Game.flags['haul'], {preferHighway: true});
                return;
            }
            let container = this.creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: creep => creep.name.match('container') && creep.store.getFreeCapacity()});
            if(container) {
                if(!this.creep.pos.inRangeTo(container, 1)) {
                    this.creep.travelTo(container);
                    return;
                } 
                this.creep.transfer(container, RESOURCE_OPS);
                return
            }
            return;
        }

        let storage = Game.rooms['W12N9'].storage;
        if(storage) {
            if(!this.creep.pos.isNearTo(storage)) this.creep.travelTo(storage);
            else this.creep.withdraw(storage, RESOURCE_OPS);
        }
    }
}
*/