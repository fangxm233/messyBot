import { Role } from "./role";
import Tasks from "creep-tasks";
import { isStoreStructure } from "../declarations/typeGuards";
import { profile } from "../profiler/decorator";
import { Traveler } from "../programs/Traveler";
import { Processes } from "../process/processes";
import { ProcessBoost } from "../process/instances/boost";
import { Process } from "../process/process";

@profile
export class RoleHauler extends Role {
    run() {
        // if (!Memory.gotoHaul || !Game.flags['haul']) return;
        // if (this.creep.hits < this.creep.hitsMax) Memory.gotoHaul = false;
        let roomName = Game.flags['haul'].pos.roomName;

        if(!(this.creep.memory as any).back) {
            if(!this.creep.store.getFreeCapacity()) {
                (this.creep.memory as any).back = true;
                return;
            }

            if(this.creep.room.name != roomName) {
                this.creep.travelTo(new RoomPosition(4, 18, roomName));
                return;
            }

            let store: (StoreStructure | Ruin)[] = this.creep.room.find(FIND_STRUCTURES, {filter: s => isStoreStructure(s) && s.store.getUsedCapacity() && !s.pos.lookForStructure(STRUCTURE_RAMPART)}) as any;
            store.push(...this.creep.room.find(FIND_RUINS, {filter: r => r.store.getUsedCapacity() && !r.pos.lookForStructure(STRUCTURE_RAMPART)}));

            let target = this.creep.pos.findClosestByRange(store);
            if(!target) {
                (this.creep.memory as any).back = true;
                return;
            }

            if(!this.creep.pos.isNearTo(target)) {
                this.creep.travelTo(target);
                return;
            }

            for (const resource in target.store) {
                this.creep.withdraw(target, resource as any);
                break;
            }

        } else {
            if(!this.creep.store.getUsedCapacity()) {
                (this.creep.memory as any).back = false;
                return;
            }

            let room = Game.rooms[this.creep.memory.spawnRoom];
            if(!room) return;
            let terminal = room.terminal;
            if(!terminal) return;
            if(!this.creep.pos.isNearTo(terminal)) {
                this.creep.travelTo(terminal, {allowHostile: false});
                return;
            }
            
            for (const resource in this.creep.store) {
                this.creep.transfer(terminal, resource as any);
                break;
            }
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

export class RoleHauler extends Role {
    run() {
        if(this.isBoosted() && this.creep.memory.sleep) {
            delete this.creep.memory.sleep;
        }
        if(this.creep.memory.sleep) return;
        if(!this.creep.ticksToLive) return;
        if(!ProcessBoost.enoughToBoost(this.creep.room.name, ['XKH2O', 'XZHO2', 'XLH2O'], this.creep)) {
            (Memory as any).hhh = true;
        }
        if((this.creep.ticksToLive || 0) > 1300 && !this.isBoosted() && ProcessBoost.enoughToBoost(this.creep.room.name, ['XKH2O', 'XZHO2', 'XLH2O'], this.creep) && !Process.getProcess(this.creep.room.name, 'boost')) {
            Processes.processBoost(this.creep.room.name, ['XKH2O', 'XZHO2', 'XLH2O'], this.creep.name);
            this.creep.memory.sleep = true;
        }
        if(!this.isBoosted()) return;

        if(this.creep.store.energy == 0) {
            // if(this.creep.room.name != this.creep.memory.spawnRoom) {
            //     // this.creep.suicide();
            //     return;
            // }
            let storage = this.creep.room.storage;
            if(storage) {
                if(this.creep.pos.isNearTo(storage)) this.creep.withdraw(storage, RESOURCE_ENERGY);
                else this.creep.travelTo(storage);
            }
        } else {
            // if(this.creep.room.name != 'W9S11'){ 
            //     let coord = this.creep.pos.roomCoords;
            //     if(this.creep.room.name == 'W10S3') {
            //         this.creep.travelTo(new RoomPosition(46,6,'W11S3'), {stuckValue: 1, repath: 1, ignoreCreeps: false});
            //         return;
            //     }
            //     if(this.creep.room.name == 'W11S3') {
            //         this.creep.travelTo(new RoomPosition(33,2,'W11S4'));
            //         return;
            //     }
            //     if(coord.y <= 3 || this.creep.room.name.match('N')) {
            //         this.creep.travelTo(new RoomPosition(46,6,'W11S3'), {preferHighway: true, stuckValue: 1});
            //         return;
            //     }
            //     this.creep.travelTo(new RoomPosition(25,25,'W9S11'), {preferHighway: true, stuckValue: 1});
            //     return;
            // }

            let sites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
            let site = this.creep.pos.findClosestByRange(sites);
            let controller = this.creep.room.controller;
            if(site) {
                if(this.creep.pos.inRangeTo(site, 3)) this.creep.build(site);
                else this.creep.travelTo(site);
            } else if(controller) {
                if(this.creep.pos.inRangeTo(controller, 3)) this.creep.upgradeController(controller);
                else this.creep.travelTo(controller);
            }
        }
    }
    isBoosted(): boolean {
        return !!this.creep.body[0].boost
    }
}

*/