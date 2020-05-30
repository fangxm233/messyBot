import { Role } from "./role";
import { profile } from "../profiler/decorator";

@profile
export class RoleDefencer extends Role{
    targetName: string;
    type: 'creep' | 'coreDis';
    invaders: Creep[];
    wounded: Creep[];

    constructor(creep: Creep, targetName: string, type: 'creep' | 'coreDis'){
        super(creep);
        this.targetName = targetName;
        this.type = type;
    }

    run() {
        if(this.type == 'creep') this.runDefencer(this.invaders, this.wounded);
        if(this.type == 'coreDis') this.runCoreDis();
    }

    runDefencer(invaders: Creep[], wounded: Creep[]){
        if(this.creep.hits < this.creep.hitsMax) this.creep.heal(this.creep);

        let room = Game.rooms[this.targetName];
        if(!room){
            this.creep.travelTo(new RoomPosition(25, 25, this.targetName));
            return;
        }
        if(this.creep.room.name != this.targetName){
            this.creep.travelTo(new RoomPosition(25, 25, this.targetName));
            return;
        }

        if(invaders.length){
            let target = this.creep.pos.findClosestByRange(invaders);
            if(target){
                if(this.creep.pos.inRangeTo(target, 3)) this.creep.rangedAttack(target);    
                this.creep.moveTo(target, { ignoreRoads: true });
            }
            return;
        }

        if(wounded.length){
            let target = this.creep.pos.findClosestByRange(wounded);
            if(target){
                if(!this.creep.pos.inRangeTo(target, 1)) this.creep.travelTo(target);
                else this.creep.heal(target);
            }
            return;
        }
    }

    runCoreDis(){
        let room = Game.rooms[this.targetName];
        if(!room){
            this.creep.travelTo(new RoomPosition(25, 25, this.targetName));
            return;
        }

        let target = room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_INVADER_CORE})[0];
        if(target){
            if(!this.creep.pos.inRangeTo(target, 1)) this.creep.travelTo(target);
            else this.creep.attack(target);
        }
    }
}