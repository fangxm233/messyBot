import { Role } from "./role";
import { SourceManager } from "../programs/sourceManager";
import { Alloter } from "../logistics/alloter";
import { profile } from "../profiler/decorator";
import { refreshRoomPosition } from "../utils";

@profile
export class RoleTransporter extends Role {
    run() {
        if (!this.creep.memory.allotUnit) {
            this.creep.memory.allotUnit = SourceManager.allotTransporter(Game.rooms[this.creep.memory.spawnRoom]);
        }
        if (!this.creep.memory.allotUnit) return;
        if(this.creep.memory.allotUnit.data.mineral) this.runMineralTransporter();
        else this.runTransporter();
    }

    runTransporter(){
        if (!(this.creep.ticksToLive && this.creep.ticksToLive <= this.creep.memory.allotUnit.data.distance * 2))
            Alloter.refreshDirty(this.creep.memory.allotUnit);
        if(Game.cpu.bucket < 5000) return;
        if (this.creep.store.energy < this.creep.store.getCapacity() * 0.66) {
            let pos = this.creep.memory.allotUnit.data.pos;
            pos = refreshRoomPosition(pos);
            if(this.creep.room.name != pos.roomName){
                let resource = this.creep.pos.lookFor(LOOK_RESOURCES).filter(resource => resource.resourceType == RESOURCE_ENERGY)[0];
                if(resource) this.creep.pickup(resource);
                this.creep.travelTo(pos);
                return;
            }
            if(!this.creep.memory.containerId){
                let containers = pos.findInRange(FIND_STRUCTURES, 1, { filter: {structureType: STRUCTURE_CONTAINER} });
                let container: AnyStructure | null = null;
                if(containers.length) container = containers[0];
                if(container) this.creep.memory.containerId = container.id;    
            }
            let container = Game.getObjectById<StructureContainer>(this.creep.memory.containerId);
            let remain = this.creep.store.getFreeCapacity();

            if(!container){
                let drops = pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                let drop = _.max(drops, (drop: Resource) => drop.amount);
                if(drop && drop.amount > remain){
                    if (this.creep.pickup(drops[0]) == ERR_NOT_IN_RANGE)
                        this.creep.travelTo(drops[0]);
                        return;
                }else{
                    if(this.creep.pos.getRangeTo(pos) > 3){
                        this.creep.travelTo(pos)
                    }
                }
            }

            if(container && this.creep.pos.getRangeTo(container) > 1){
                let resource = this.creep.pos.lookFor(LOOK_RESOURCES).filter(resource => resource.resourceType == RESOURCE_ENERGY)[0];
                if(resource) this.creep.pickup(resource);
                this.creep.travelTo(container);
            }else if(container && container.store.energy >= remain) this.creep.withdraw(container, RESOURCE_ENERGY);
        }
        else {
            // if(this.creep.room.name != this.creep.memory.spawnRoom){
            //     let targets = _.filter(this.creep.room.roads, 
            //         structure => structure.hits < structure.hitsMax && structure.pos.getRangeTo(this.creep.pos) <= 3);
            //     let target = _.min(targets, target => target.hits);
            //     if(target) this.creep.repair(target);    
            // }
            let storage = Game.getObjectById<StructureStorage>(Memory.rooms[this.creep.memory.spawnRoom].storage);
            if(storage){
                if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    let resource = this.creep.pos.lookFor(LOOK_RESOURCES).filter(resource => resource.resourceType == RESOURCE_ENERGY)[0];
                    if(resource) this.creep.pickup(resource);
                    this.creep.travelTo(storage);
                }
            }
        }
    }

    runMineralTransporter(){
        if (this.creep.memory.allotUnit) Alloter.refreshDirty(this.creep.memory.allotUnit);
        let mineral = Game.getObjectById<Mineral>(this.creep.room.memory.mineral.mineralId);
        let container = Game.getObjectById<StructureContainer>(this.creep.room.memory.mineral.containerId);
        if(!mineral || !container) return;
        if(!this.creep.store.getUsedCapacity(mineral.mineralType)){
            let store = container.store.getUsedCapacity(mineral.mineralType);
            if(!store) return;
            if(this.creep.pos.getRangeTo(container) > 1){
                this.creep.travelTo(container);
                return;
            }
            if(container.store.energy > 0) this.creep.withdraw(container, RESOURCE_ENERGY);
            if(this.creep.store.energy > 0) this.creep.drop(RESOURCE_ENERGY);
            if(store >= this.creep.store.getFreeCapacity()){
                this.creep.withdraw(container, mineral.mineralType);
            }
        }else{
            let terminal = this.creep.room.terminal;
            if(terminal){
                if (this.creep.transfer(terminal, mineral.mineralType) == ERR_NOT_IN_RANGE) 
                    this.creep.travelTo(terminal);
            }
        }
    }

    runPowerTransporter(){
        let terminal = Game.rooms[this.creep.memory.spawnRoom].terminal;
        if(!terminal) return;
        let target = this.creep.memory.target;

        if(this.creep.store.power){
            if(this.creep.room.name != this.creep.memory.spawnRoom){
                this.creep.travelTo(terminal, { preferHighway: true });
                return;
            }else if(this.creep.pos.getRangeTo(terminal) > 1){
                this.creep.travelTo(terminal);
                return;
            }else this.creep.transfer(terminal, RESOURCE_POWER);
            return;
        }
        if(this.creep.room.name != target){
            this.creep.travelTo(new RoomPosition(25, 25, target), { preferHighway: true });
            return;
        }
        let power = this.creep.room.find(FIND_DROPPED_RESOURCES, { filter: drop => drop.resourceType == RESOURCE_POWER })[0];
        let pb = this.creep.room.powerBanks[0];
        if(power){
            if(this.creep.pos.getRangeTo(power) > 1){
                this.creep.travelTo(power);
                return;
            }else this.creep.pickup(power);
        }
        if(pb){
            if(this.creep.pos.getRangeTo(pb) > 4){
                this.creep.travelTo(pb);
                return;
            }
        }
    }

    static findSmallestByHit<T extends {hits: number}>(targets: T[]) {
        var result = targets[0];
        for (const t of targets) {
            if (t.hits < result.hits) result = t;
        }
        return result;
    }
}