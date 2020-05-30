import { Process } from "../process";
import { Alloter } from "../../logistics/alloter";
import { RoleFiller } from "../../roles/filler";
import { profile } from "../../profiler/decorator";
import { RoleFactory } from "../../roles/roleFactory";
import { RolePC } from "../../roles/powerCreep";

@profile
export class ProcessFilling extends Process{
    constructor(roomName: string){
        super(roomName, 'filling');
    }

    static getInstance(struct: ProcessInterface, roomName: string): ProcessFilling {
        return new ProcessFilling(roomName);
    }

    check(): boolean{
        this.foreachCreep(this.refreshAllot); //优化点
        if(!Game.rooms[this.roomName].isFull) {
            return !RolePC.pcAbility[this.roomName]
        }
        return false;
    }

    run(){
        this.foreachCreep(this.runCreep);
        let sleep = true;
        this.foreachCreep(creep => { if(!creep.memory.sleep) sleep = false; });
        if(sleep && Game.rooms[this.roomName].isFull) this.suspend();
    }

    runCreep(creep : Creep){
        let role = RoleFactory.getRole(creep);
        if(role) role.run();
    }

    refreshAllot(creep: Creep){
        if(creep.ticksToLive && creep.ticksToLive <= creep.body.length * 3) return;
        if(creep.memory.allotUnit) Alloter.refreshDirty(creep.memory.allotUnit);
    }

    refillNeeded(spawnBusy: boolean) {
        if(this.state == 'active') return;
        if(!RolePC.pcAbility[this.roomName]) {
            this.awake();
            return;
        }
        let pc = RolePC.pcAbility[this.roomName][PWR_OPERATE_EXTENSION];
        if(pc.cooldown) {
            this.awake();
            return;
        }
        let role = pc.role;
        role.refillNeeded = true;
        if(!spawnBusy) this.awake();
    }
}