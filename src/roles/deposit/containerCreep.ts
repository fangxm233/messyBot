import { profile } from "../../profiler/decorator";
import { Role } from "../role";
import { Traveler } from "../../programs/Traveler";

@profile
export class RoleContainer extends Role{
    targetName: string;
    type: DepositConstant;
    
    constructor(creep: Creep, targetName: string, type: DepositConstant){
        super(creep);
        this.targetName = targetName;
        this.type = type;
    }

    run(){
        if(this.creep.room.name != this.targetName){
            let room = Game.rooms[this.targetName];
            if(room) this.creep.travelTo(room.find(FIND_DEPOSITS, {filter: deposit => deposit.lastCooldown < 101})[0], {allowHostile: false});
            else this.creep.travelTo(new RoomPosition(25, 25, this.targetName), {allowHostile: false});
            return;
        }

        if(this.creep.pos.isEdge) Traveler.avoidEdge(this.creep);

        let harvester = this.creep.room.find(FIND_MY_CREEPS, { filter: creep => creep.memory.role == 'dHarvester' })[0];
        let resource = this.creep.room.find(FIND_DROPPED_RESOURCES).filter(resource => resource.resourceType == this.type)[0];
        if(resource) {
            if(!this.creep.pos.isNearTo(resource)) this.creep.travelTo(resource, {allowHostile: false});
            this.creep.pickup(resource);
            return;
        }
        let tombs = this.creep.room.find(FIND_TOMBSTONES, {filter: tomb => !!tomb.store[this.type] && this.creep.pos.inRangeTo(tomb, 1)});
        if(tombs.length) this.creep.withdraw(tombs[0], this.type);
        if(!harvester) return;
        if(!this.creep.pos.isNearTo(harvester)) this.creep.travelTo(harvester, {allowHostile: false});
    }
}