import { profile } from "../profiler/decorator";
import { Role } from "./role";

@profile
export class RolePowerHealer extends Role{
    target: string;

    constructor(creep: Creep, target: string){
        super(creep);
        this.target = target;
    }

    run(){
        let room = Game.rooms[this.target];

        if(!room){
            this.creep.travelTo(new RoomPosition(25, 25, this.target), {allowHostile: false});
            return;
        }

        let powerBank = room.powerBanks[0];
        let attackCreep = room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role == 'powerAttack' })[0];

        if(this.creep.hits < this.creep.hitsMax) this.creep.heal(this.creep);

        if(!attackCreep){
            if(powerBank && this.creep.pos.getRangeTo(powerBank) > 3){
                this.creep.travelTo(powerBank, {allowHostile: false});
                return;
            }
            if(!powerBank) {
                this.creep.suicide();
                return;
            }

        }else{
            if(!powerBank){
                let icreeps = this.creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.hits < creep.hitsMax });
                if(icreeps.length){
                    if(this.creep.pos.getRangeTo(icreeps[0]) > 3) this.creep.travelTo(icreeps[0], { range: 3 });
                    else this.creep.heal(icreeps[0]);
                }
                return;
            }
            if(this.creep.pos.getRangeTo(attackCreep) > 1) this.creep.travelTo(attackCreep, { pushCreep: false, movingTarget: true, allowHostile: false });
            if(powerBank) this.creep.heal(attackCreep);
        }
    }
}