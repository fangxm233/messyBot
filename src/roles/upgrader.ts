import Tasks from 'creep-tasks';
import { profile } from "../profiler/decorator";
import { SourceManager } from "../programs/sourceManager";
import { Role } from "./role";

@profile
export class RoleUpgrader extends Role {
    run() {
        // if(Game.cpu.bucket < 5000) return;
        if(this.creep.isIdle) {
            if(this.creep.store.energy == 0){
                SourceManager.getSource(this.creep, false);
            }else{
                let controller = Game.rooms[this.creep.memory.spawnRoom].controller;
                if(controller){
                    this.creep.task = Tasks.upgrade(controller);
                }    
            }
        }
        if(this.creep.task) this.creep.task.run();
    }
}