import Tasks from 'creep-tasks';
import { profile } from "../profiler/decorator";
import { SourceManager } from "../programs/sourceManager";
import { Role } from "./role";
import { ProcessBoost } from '../process/instances/boost';
import { Processes } from '../process/processes';
import { USER_NAME } from '../config';
import { RoomPlanner } from '../roomPlanner/RoomPlanner';
import { Process } from '../process/process';

@profile
export class RoleUpgrader extends Role {
    run() {
        // if(Game.cpu.bucket < 5000) return;
        if(this.isBoosted() && this.creep.memory.sleep) {
            delete this.creep.memory.sleep;
        }
        if(this.creep.memory.sleep) return;
        if(!this.creep.ticksToLive) return;
        if(this.creep.ticksToLive == 1500) return;
        if((this.creep.ticksToLive || 0) > 1300 && !this.isBoosted() && ProcessBoost.enoughToBoost(this.creep.room.name, ['XGH2O'], this.creep) && !Process.getProcess(this.creep.room.name, 'boost')) {
            Processes.processBoost(this.creep.room.name, ['XGH2O'], this.creep.name);
            this.creep.memory.sleep = true;
        }
        if((this.creep.ticksToLive || 1500) < 50 && !this.creep.store.energy && this.isBoosted()) {
            let rp = new RoomPlanner(this.creep.room.name);
            let lab = rp.getLabs().filter(lab => !lab.cooldown)[0];
            if(lab) {
                if(!this.creep.pos.isNearTo(lab)) this.creep.travelTo(lab);
                else {
                    lab.unboostCreep(this.creep);
                    this.creep.suicide()
                }
                return;
            }
        }

        if(this.creep.isIdle) {
            if(this.creep.store.energy == 0){
                SourceManager.getSource(this.creep, false);
            }else{
                let controller = Game.rooms[this.creep.memory.spawnRoom].controller;
                if(controller){
                    this.creep.task = Tasks.upgrade(controller, {moveOptions: {range: 1}});
                }    
            }
        }
        if(this.creep.task) this.creep.task.run();
    }

    isBoosted(): boolean {
        return !!this.creep.body[0].boost
    }
}