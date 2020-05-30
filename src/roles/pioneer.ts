import { Role } from './role';
import { Alloter } from '../logistics/alloter';
import { SourceManager } from '../programs/sourceManager';
import { profile } from '../profiler/decorator';
import { RoomPlanner } from '../roomPlanner/RoomPlanner';
import { structureLayout } from '../roomPlanner/building';
import { refreshRoomPosition } from '../utils';
import Tasks from 'creep-tasks'

@profile
export class RolePioneer extends Role{
    run(){
        let roomName = this.creep.room.name;
        // if(Game.shard.name == 'shard3') {
        //     if(roomName == 'W48N22') {
        //         this.creep.travelTo(new RoomPosition(25, 26, 'W49N22'));
        //         return;
        //     }
        //     if(roomName == 'W49N22') {
        //         if(this.creep.pos.y < 40) {
        //             this.creep.travelTo(new RoomPosition(25, 41, 'W49N22'));
        //             return;
        //         }
        //         this.creep.travelTo(new RoomPosition(25, 25, 'W50N20'));
        //         return;
        //     }
        //     if(roomName == 'W49N21' || roomName == 'W49N20') {
        //         this.creep.travelTo(new RoomPosition(25, 25, 'W50N20'));
        //         return;
        //     } else {
        //         let par = Game.getObjectById<StructurePortal>('5c0e406c504e0a34e3d61d48');
        //         if(par) {
        //             this.creep.travelTo(par);
        //         }
        //     }
        //     return;
        // }
        // if(Game.shard.name == 'shard2') {
        //     if(roomName != 'W49N21') {
        //         this.creep.travelTo(new RoomPosition(25,25,'W49N21'));
        //         return;
        //     }
        // }

        if(!Memory.spawnRoom){
            this.creep.suicide();
            return;
        }
        let pos = new RoomPlanner(Memory.spawnRoom).toRoomPos(structureLayout[1].buildings.spawn.pos[0]);


        // if(this.creep.room.name != 'E45N25') {
        //     this.creep.travelTo(new RoomPosition(25, 25, 'E45N25'));
        //     return;
        // }

        if(this.creep.room.name != Memory.spawnRoom){
            let flags = _.filter(Game.flags, flag => flag.name.match('path'));
            if(flags.length){
                // flags.sort((f1, f2) => Number.parseInt(f1.name.slice(4)) - Number.parseInt(f2.name.slice(4)));
                if(this.creep.memory.targetIndex === undefined) this.creep.memory.targetIndex = 0;
                // flags.filter(f => Number.parseInt(f.name.slice(4)) >= this.creep.memory.targetIndex);
                let flag = Game.flags['path' + this.creep.memory.targetIndex];
                if(!flag){
                    this.creep.memory.targetIndex++;
                    return;
                }
                if(!this.creep.pos.isNearTo(flag)){//this.creep.room.name != flag.pos.roomName
                    this.creep.travelTo(flag, { preferHighway: true });
                    return;
                } else {
                    // this.creep.travelTo(flag, { preferHighway: true });
                    if(this.creep.room.portals.length) {
                        if(_.find(this.creep.room.portals, p => p.pos.isEqualTo(flag.pos))) {
                            this.creep.travelTo(flag);
                            if(!this.creep.pos.inRangeTo(flag, 1)) this.creep.memory.targetIndex--;
                        }
                    }
                    this.creep.memory.targetIndex++;
                    return;
                }
            } else this.creep.travelTo(new RoomPosition(25, 25, Memory.spawnRoom), {preferHighway: true, allowHostile: true});
            return;
        }
        let spawn = pos.lookForStructure(STRUCTURE_SPAWN);
        let site = pos.lookFor(LOOK_CONSTRUCTION_SITES)[0];
        let controller = this.creep.room.controller;
        if(!controller) return;
        // if(spawn){
        //     // Game.flags['spawn'].remove();
        //     // new RoomPosition(25, 25, 'E41N34').createFlag('unclaim');
        //     // this.creep.memory.role = 'worker';
        //     if(Memory.stableData[this.creep.room.name]) Memory.stableData[this.creep.room.name].finished = false;
        //     this.creep.memory.spawnRoom = this.creep.room.name;
        //     return;
        // }
        if(!site && !spawn) pos.createConstructionSite(STRUCTURE_SPAWN)
        let hasClaim = !!this.creep.bodyCounts[CLAIM];
        if(hasClaim){
            if(this.creep.room.controller && !this.creep.room.controller.owner){
                Memory.claimed = false;
                if(this.creep.claimController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(this.creep.room.controller);
                } else this.creep.signController(this.creep.room.controller, 
                    '🍄');
                return;
            } else { 
                Memory.claimed = true;
                Memory.stableData[this.creep.room.name].finished = false;
                this.creep.room.structures.forEach(structure => structure.destroy());
                this.creep.suicide();
                return; 
            }
        }
        
        if(this.creep.isIdle) this.chooseWork();
        if(this.creep.task) {
            if(this.creep.task.name == 'getRenewed') {
                const spawn = this.creep.task.target as StructureSpawn;
                if(!this.creep.store.energy && spawn.store.energy < 30) {
                    this.creep.task.finish();
                    return;
                }
                else if(this.creep.store.energy && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 100) 
                    this.creep.transfer(spawn, RESOURCE_ENERGY);
            }
            this.creep.task.run();
        }

    }

    chooseWork() {
        if(!this.creep.store.energy) {
            let code = SourceManager.getSource(this.creep, true, 200, true);
            if(!code) {
                const sources = this.creep.room.find(FIND_SOURCES, {filter: source => source.energy && source.pos.availableNeighbors(true, false).length > source.targetedBy.length})
                if(sources.length && this.harvestAction(sources)) return;
            }
        } else {
            if((this.creep.ticksToLive || 1500) < 500) {
                const spawns = this.creep.room.spawns.filter(spawn => !spawn.spawning && !spawn.targetedBy.length);
                if(spawns.length && this.renerAction(spawns)) return;
            }

            if((this.creep.ticksToLive || 1500) < 300) return;

            let controller = this.creep.room.controller;
            if(controller && controller.ticksToDowngrade <= (controller.level >= 4 ? 10000 : 2000))
                if(this.upgradeAction()) return;

            let repairList = _.filter(this.creep.room.structures, structure => structure.structureType != STRUCTURE_RAMPART
                && structure.structureType != STRUCTURE_WALL && structure.hits < structure.hitsMax * 0.6);
            if(repairList.length)
                if(this.repairAction(repairList)) return;    

            let towers: (StructureExtension | StructureSpawn | StructureTower)[] = this.creep.room.towers.filter(tower => tower.store.energy < 600);
            towers.push(...this.creep.room.extensions.filter(ext => !!ext.store.getFreeCapacity(RESOURCE_ENERGY)));
            towers.push(...this.creep.room.spawns.filter(spawn => !!spawn.store.getFreeCapacity(RESOURCE_ENERGY)))
            if(towers.length && this.transferAction(RESOURCE_ENERGY, towers)) return;
            
            let buildSites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
            if(buildSites.length) 
                if(this.buildAction(buildSites)) return;
            
            if(this.upgradeAction()) return;
        }
    }

    harvestAction(sources: Source[]): boolean {
        if(!sources.length) return false;
        const source = this.creep.pos.findClosestByRange(sources);
        if(!source) return false;
        this.creep.task = Tasks.harvest(source);
        return true;
    }

    repairAction(repairList: Structure[]): boolean{
        if(!repairList.length)return false;
        let target = this.creep.pos.findClosestByRange(repairList);
        if(!target) return false;
        this.creep.task = Tasks.repair(target);
        return true;
    }

    buildAction(buildSites: ConstructionSite[]): boolean{
        if(!buildSites.length) return false;
        let target = this.creep.pos.findClosestByRange(buildSites);
        if(!target) return false;
        this.creep.task = Tasks.build(target);
        return true;
    }

    upgradeAction(): boolean{
        let controller = this.creep.room.controller;
        if(controller){
            this.creep.task = Tasks.upgrade(controller);
            return true;
        }
        return false;
    }

    renerAction(spawns: StructureSpawn[]): boolean{
        if(!spawns.length) return false;
        let target = this.creep.pos.findClosestByRange(spawns);
        if(!target) return false;
        this.creep.task = Tasks.getRenewed(target);
        return true;
    }

    transferAction(type: ResourceConstant, targets: transferTargetType[]): boolean{
        targets = targets.filter(target => !target.targetedBy.length)
        if(!targets.length) return false;
        let target = this.creep.pos.findClosestByRange(targets);
        if(!target) return false;
        this.creep.task = Tasks.transfer(target, type);
        return true;
    }

    static getRoomRange(r1: string, r2: string){
        return new RoomPosition(1, 1, r1).getSqrtRoomRangeTo(new RoomPosition(1, 1, r2));
    }
}

/*
        if(site){
            let source = Game.getObjectById<Source>(this.creep.memory.sourceId);
            if(this.creep.memory.allotUnit) Alloter.refreshDirty(this.creep.memory.allotUnit);
            else this.creep.memory.allotUnit = SourceManager.allotSource(this.creep.room);
            if(!this.creep.memory.allotUnit) return;

            if(this.creep.memory.building && this.creep.store.energy == 0) {
                this.creep.memory.building = false;
            }
            if(!this.creep.memory.building && this.creep.store.energy == this.creep.store.getCapacity()) {
                this.creep.memory.building = true;
            }
            if(!this.creep.memory.building && source && source.energy == 0 && this.creep.store.energy > 0){
                this.creep.memory.building = true;
            }
            
            if(this.creep.memory.building) {
                if(this.creep.build(site) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(site);
                }
            }
            else {
                let drop = this.creep.room.find(FIND_DROPPED_RESOURCES, { filter: resource => resource.resourceType == RESOURCE_ENERGY})[0]
                if(drop){
                    if(!this.creep.pos.isNearTo(drop)) this.creep.travelTo(drop);
                    else this.creep.pickup(drop);
                    return;
                }
    
                let pos = this.creep.memory.allotUnit.data.pos;
                pos = refreshRoomPosition(pos);
                if(!this.creep.memory.sourceId){
                    let sources = pos.findInRange(FIND_SOURCES, 0);
                    if(sources.length) this.creep.memory.sourceId = sources[0].id;
                }        
                if(!source) return;
                if(this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(source);
                }
            }
        }
*/