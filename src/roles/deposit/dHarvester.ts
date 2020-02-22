import { profile } from "../../profiler/decorator";
import { Role } from "../role";

@profile
export class RoleDHarvester extends Role{
    targetName: string;

    constructor(creep: Creep, targetName: string){
        super(creep);
        this.targetName = targetName;
    }

    run(){
        if(this.creep.room.name != this.targetName){
            let room = Game.rooms[this.targetName];
            if(room) this.creep.travelTo(room.find(FIND_DEPOSITS, {filter: deposit => deposit.lastCooldown < 101})[0], {preferHighway: true});
            else this.creep.travelTo(new RoomPosition(25, 25, this.targetName), {preferHighway: true});
            return;
        }

        let deposit = this.creep.room.find(FIND_DEPOSITS, {filter: deposit => deposit.lastCooldown < 101})[0];
        if(!deposit) return;
        if(!this.creep.pos.isNearTo(deposit)) {
            this.creep.travelTo(deposit, {preferHighway: true});
            return;
        }

        if(this.creep.carry.getFreeCapacity() && deposit.cooldown == 0) this.creep.harvest(deposit);

        let containerCreep = this.creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role == 'container' })[0];
        if(!containerCreep) return;
        if(this.creep.pos.isNearTo(containerCreep) && this.creep.store.getFreeCapacity() <= 5) this.creep.transfer(containerCreep, deposit.depositType);
    }
}