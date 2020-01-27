import { Role } from './role';
import { Alloter } from '../logistics/alloter';
import { SourceManager } from '../programs/sourceManager';
import { profile } from '../profiler/decorator';
import { RoomPlanner } from '../roomPlanner/RoomPlanner';
import { structureLayout } from '../roomPlanner/building';

@profile
export class RolePioneer extends Role{
    run(){
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
                if(this.creep.room.name != flag.pos.roomName){
                    this.creep.travelTo(flag, { preferHighway: true });
                    return;
                } else {
                    this.creep.travelTo(flag, { preferHighway: true });
                    if(this.creep.room.portals.length) {
                        if(_.find(this.creep.room.portals, p => p.pos.isEqualTo(flag.pos))) {
                            this.creep.travelTo(flag);
                            if(!this.creep.pos.inRangeTo(flag, 1)) this.creep.memory.targetIndex--;
                        }
                    }
                    this.creep.memory.targetIndex++;
                    return;
                }
            } else this.creep.travelTo(pos, {preferHighway: true});
            return;
        }
        let spawn = pos.findInRange(FIND_MY_SPAWNS, 0)[0];
        let site = pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 0)[0];
        let controller = this.creep.room.controller;
        if(!controller) return;
        if(spawn){
            Game.flags['spawn'].remove();
            // new RoomPosition(25, 25, 'E41N34').createFlag('unclaim');
            this.creep.memory.role = 'worker';
            if(Memory.stableData[this.creep.room.name]) Memory.stableData[this.creep.room.name].finished = false;
            this.creep.memory.spawnRoom = this.creep.room.name;
            return;
        }
        if(!site) pos.createConstructionSite(STRUCTURE_SPAWN)
        let hasClaim = this.creep.body.filter((value: BodyPartDefinition) => value.type == CLAIM).length != 0;
        if(hasClaim){
            if(this.creep.room.controller && !this.creep.room.controller.owner){
                Memory.claimed = false;
                if(this.creep.claimController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(this.creep.room.controller);
                } else this.creep.signController(this.creep.room.controller, 
                    'It\'s a temparary room and will leave after rcl reached 3. Sorry for any inconvenience.');
                return;
            } else { 
                Memory.claimed = true;
                Memory.stableData[this.creep.room.name].finished = false;
                this.creep.room.structures.forEach(structure => structure.destroy())
                this.creep.suicide();
                return; 
            }
        }
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
    }

    static getRoomRange(r1: string, r2: string){
        return new RoomPosition(1, 1, r1).getSqrtRoomRangeTo(new RoomPosition(1, 1, r2));
    }
}