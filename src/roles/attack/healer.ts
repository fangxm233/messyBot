import { Role } from "../role";
import { profile } from "../../profiler/decorator";
import { ProcessAttack } from "../../process/instances/attack";
import { Traveler } from "../../programs/Traveler";
import { RoleFactory } from "../roleFactory";
import { RoleWarrior } from "./warrior";
import { RoleDestroyer } from "./destroyer";
import { possibleDamage, possibleTowerDamage } from "../../utils";
import { USER_NAME } from "../../config";

@profile
export class RoleHealer extends Role {
    process: ProcessAttack;
    moved = false;

    run() {
        let targetRoom = this.process.targetRoom;
        let room = Game.rooms[targetRoom];

        let injured = this.creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: creep => creep.hits < creep.hitsMax});
        if(injured.length && !this.creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: creep => !creep.my && !!creep.bodyCounts[ATTACK]}).length) {
            this.heal(_.min(injured, creep => creep.hits));
            // this.heal(_.min(injured, creep => creep.pos.getRangeTo(this.creep)));
            // return;
        }
        else if(this.creep.room.find(FIND_HOSTILE_CREEPS).length){
            this.creep.heal(this.creep);
        } 
        if(!this.creep.memory.healingName) return;
        let healing = Game.creeps[this.creep.memory.healingName];
        if(!healing) {
            // this.creep.suicide();
            return;
        }
        let role = RoleFactory.getRole(healing) as RoleWarrior | RoleDestroyer;
        if(!role || !role.prepared) return;
        // if(!room || this.creep.room.name != targetRoom) {
        //     this.heal(healing);
        //     if(!this.creep.pos.isNearTo(healing) && !this.creep.pos.isEdge) return;
        //     if(!this.moved) this.creep.travelTo(new RoomPosition(25, 25, targetRoom));
        //     return;
        // }
        // if(this.creep.room.name == targetRoom && this.creep.pos.isEdge) {
        //     if(!this.moved) Traveler.avoidEdge(this.creep);
        //     return;
        // }

        // if(healing.room.name != this.creep.room.name) {
        //     this.heal(this.creep);
        //     return;
        // }
        if(this.creep.pos.isEdge && this.creep.room.name == healing.room.name) {
            Traveler.avoidEdge(this.creep);
            return;
        }

        // let damage = possibleDamage(healing.body, healing.pos, USER_NAME, false, possibleTowerDamage(this.creep.room, healing.pos))
        // if(this.creep.room.name != this.process.targetRoom || !damage) {
            if(!this.moved) this.creep.travelTo(healing, {ignoreCreeps: this.creep.room.name == this.process.targetRoom ? false : true, pushCreep: this.creep.room.name == this.process.targetRoom ? false : false, repath: 0.5, range: 0, maxRooms: 1})
            // this.creep.moveTo(healing, {reusePath: 0});
            // if(this.creep.hits < this.creep.hitsMax - 500) this.heal(this.creep);
            //  else
            // let injured = this.creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: creep => creep.hits < creep.hitsMax});
            // if(injured.length && !this.creep.room.find(FIND_HOSTILE_CREEPS, {filter: creep => !creep.my && !!creep.bodyCounts[ATTACK]}).length) {
            //     this.heal(_.min(injured, creep => creep.hits));
            //     // this.heal(_.min(injured, creep => creep.pos.getRangeTo(this.creep)));
            //     return;
            // }
            // this.heal(this.creep);

            // if(this.creep.pos.isNearTo(healing) && this.creep.room.name == targetRoom) {
            //     if(this.creep.name == '_healer_1aeonz') {
            //         if(!this.creep.pos.isEqualTo(new RoomPosition(48, 14, 'W11S22')))
            //             this.creep.travelTo(new RoomPosition(48, 14, 'W11S22'))
            //     }
            //     if(this.creep.name == '_healer_0aeonu') {
            //         if(!this.creep.pos.isEqualTo(new RoomPosition(48, 11, 'W11S22')))
            //             this.creep.travelTo(new RoomPosition(48, 11, 'W11S22'))
            //     }        
            // }
        // } else {
        //     let site = this.creep.pos.findClosestByRange(FIND_HOSTILE_CONSTRUCTION_SITES);
        //     if(site) this.creep.travelTo(site);
        // }
    }

    heal(target: Creep) {
        if(!this.creep.room.find(FIND_HOSTILE_CREEPS).length && this.creep.hits == this.creep.hitsMax) return;
        if(this.creep.pos.isNearTo(target)) this.creep.heal(target);
        else this.creep.rangedHeal(target);
    }

    go(dir: DirectionConstant) {
        if(this.moved) return;
        if(this.process && this.creep.room.name == this.process.targetRoom && !this.process.agressiveCreeps.length) return;
        if(this.process && !this.creep.pos.isEdge ) {//&& this.creep.room.name != this.process.targetRoom
            let pos = Traveler.positionAtDirection(this.creep.pos, dir);
            if(!pos) return;
            let terrain = Game.map.getRoomTerrain(this.creep.room.name).get(pos.x, pos.y);
            if(terrain == TERRAIN_MASK_SWAMP || !pos.isWalkable(true, false)) return;
        }
        this.creep.move(dir);
        this.setMoved();
    }

    setMoved() {
        this.moved = true;
    }
}