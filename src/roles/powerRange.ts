import { profile } from "../profiler/decorator";
import { Role } from "./role";

@profile
export class RolePowerRange extends Role{
    target: string;

    constructor(creep: Creep, target: string){
        super(creep);
        this.target = target;
    }

    run(){
        let room = Game.rooms[this.target];
        if(!room){
            this.creep.travelTo(new RoomPosition(25, 25, this.target));
            return;
        }

        let powerBank = room.powerBanks[0];
        if(!powerBank) {
            this.creep.suicide();
            return;
        }

        if(this.creep.hits > this.creep.hitsMax / 2){
            if(this.creep.pos.getRangeTo(powerBank) > 2){
                this.creep.travelTo(powerBank);
                return;
            }
            this.creep.rangedAttack(powerBank);
            this.creep.heal(this.creep);
        }
    }
}