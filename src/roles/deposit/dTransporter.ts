import { profile } from "../../profiler/decorator";
import { Role } from "../role";

@profile
export class RoleDTransporter extends Role{
    targetName: string;
    type: DepositConstant;
    closing: boolean;

    constructor(creep: Creep, targetName: string, type: DepositConstant){
        super(creep);
        this.targetName = targetName;
        this.type = type;
    }

    run(){
        if(!this.creep.ticksToLive) return;

        if(this.creep.store.getUsedCapacity() == 0){

            let resource = this.creep.room.find(FIND_DROPPED_RESOURCES).filter(resource => resource.resourceType == this.type)[0];
            if(resource && this.creep.store.getFreeCapacity()) {
                if(!this.creep.pos.isNearTo(resource)) this.creep.travelTo(resource, {allowHostile: false});
                this.creep.pickup(resource);
                return;
            }

            if(this.creep.room.name != this.targetName){
                let room = Game.rooms[this.targetName];
                if(room) this.creep.travelTo(room.find(FIND_DEPOSITS, {filter: deposit => deposit.lastCooldown < 101})[0], {allowHostile: false});
                else this.creep.travelTo(new RoomPosition(25, 25, this.targetName), {allowHostile: false});
                if(!this.creep.memory.dis && this.creep.memory._trav.path) this.creep.memory.dis = this.creep.memory._trav.path.length;
                return;
            }

            let containerCreep = this.creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role == 'container' })[0];
            if(!containerCreep) return;
            let deposit = this.creep.room.find(FIND_DEPOSITS, {filter: deposit => deposit.lastCooldown < 101})[0];
            if(!deposit) return;
            
            if(!this.creep.pos.isNearTo(containerCreep)) this.creep.travelTo(containerCreep, {allowHostile: false});
            if(containerCreep.store.getUsedCapacity(deposit.depositType) >= 
                ((this.closing || this.creep.ticksToLive < this.creep.memory.dis + 80) ? 0 : this.creep.store.getFreeCapacity())) 
                    containerCreep.transfer(this.creep, deposit.depositType);
        } else {
            let terminal = Game.rooms[this.creep.memory.spawnRoom].terminal;
            if(!terminal) return;
            let resource = this.creep.room.find(FIND_DROPPED_RESOURCES).filter(resource => resource.resourceType == this.type)[0];
            if(resource && this.creep.store.getFreeCapacity()) {
                if(!this.creep.pos.isNearTo(resource)) this.creep.travelTo(resource, {allowHostile: false});
                this.creep.pickup(resource);
                return;
            }    
            if(!this.creep.pos.isNearTo(terminal)) this.creep.travelTo(terminal, {allowHostile: false});
            else this.creep.transfer(terminal, this.type);
        }
    }
}