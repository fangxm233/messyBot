import { Role } from "./role";
import Tasks from 'creep-tasks'
import { SourceManager } from "../programs/sourceManager";
import { profile } from "../profiler/decorator";
import { Traveler } from "../programs/Traveler";

@profile
export class RoleWorker extends Role{
    run(){
        // if(Game.cpu.bucket < 5000) return;
        if(this.creep.isIdle) this.chooseWork();
        if(this.creep.task) this.creep.task.run();
    }

    chooseWork(){
        let spawnRoom = Game.rooms[this.creep.room.name];
        if(this.creep.store.energy > 0){
            let controller = spawnRoom.controller;
            if(controller && controller.ticksToDowngrade <= (controller.level >= 4 ? 10000 : 2000))
                if(this.upgradeAction()) return;
            
            let repairList = _.filter(this.creep.room.structures, structure => structure.structureType != STRUCTURE_RAMPART
                && structure.structureType != STRUCTURE_WALL && structure.hits < structure.hitsMax * 0.1);
            if(repairList.length)
                if(this.repairAction(repairList)) return;

            let buildSites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
            if(Memory.colonies[this.creep.memory.spawnRoom])
                for (const room of Memory.colonies[this.creep.memory.spawnRoom]) 
                    if(Game.rooms[room.name]) buildSites.push(...Game.rooms[room.name].find(FIND_CONSTRUCTION_SITES));
            if(buildSites.length) 
                if(this.buildAction(buildSites)) return;
            
            if(this.upgradeAction()) return;
        }
        else {
            SourceManager.getSource(this.creep, false, 750);
        }
    }

    buildAction(buildSites: ConstructionSite[]): boolean{
        if(!buildSites.length) return false;
        let target = this.creep.pos.findClosestByMultiRoomRange(buildSites);
        if(!target) return false;
        this.creep.task = Tasks.build(target);
        return true;
    }

    repairAction(repairList: Structure[]): boolean{
        if(!repairList.length)return false;
        let target = this.creep.pos.findClosestByRange(repairList);
        if(!target) return false;
        this.creep.task = Tasks.repair(target);
        return true;
    }

    upgradeAction(): boolean{
        let controller = Game.rooms[this.creep.memory.spawnRoom].controller;
        if(controller){
            this.creep.task = Tasks.upgrade(controller);
            return true;
        }
        return false;
    }
}