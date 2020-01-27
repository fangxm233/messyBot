import { Role } from "../role";
import { profile } from "../../profiler/decorator";
import { RoomPlanner } from "../../roomPlanner/RoomPlanner";
import { Tower } from "../../extensions/tower";
import { wouldBreakDefend, possibleDamage, possibleTowerDamage } from "../../utils";
import { USER_NAME } from "../../config";

@profile
export class RoleRange extends Role{
    static blackList: { [creepName: string]: number} = {};
    target: Id<Creep>;

    checkWhenNextTick: boolean = false;
    checkHit: number = 0;

    timeOut: number = 0;

    run() {
        let room = this.creep.room;
        if(!this.target) {
            let rp = new RoomPlanner(room.name);
            let center = rp.getCenterPos();
            let targets = room.find(FIND_HOSTILE_CREEPS, 
                { filter: creep => ( 0) < Game.time && creep.bodyCounts[WORK] && creep.pos.getRangeTo(center) <= 12});
            if(!targets.length) targets = room.find(FIND_HOSTILE_CREEPS, 
                { filter: creep => ( 0) < Game.time && creep.pos.getRangeTo(center) <= 12});
            if(!targets.length) return;
            this.target = targets[Math.floor(Math.random() * targets.length)].id;
        }

        // let flee = wouldBreakDefend(this.creep.body, this.creep.pos, USER_NAME, possibleTowerDamage(this.creep.room, this.creep.pos), true);
        // if(flee) {
        //     let poses = this.creep.pos.availableNeighbors(true, false)
        //         .filter(pos => !pos.lookFor(LOOK_CREEPS).length);
        //     let pos = _.min(poses, pos => possibleDamage(this.creep.body, pos, USER_NAME, false, possibleTowerDamage(this.creep.room, this.creep.pos), true));
        //     if(pos) {
        //         this.creep.moveTo(pos);
        //     }
        //     return;
        // }

        if(this.target) {
            let target = Game.getObjectById<Creep>(this.target);
            if(!target) {
                this.target = '' as any;
                return;
            }
            if(this.checkWhenNextTick) {
                this.checkWhenNextTick = false;
                if(target.hits >= this.checkHit) {
                    RoleRange.blackList[this.target] = Game.time + 10;
                    this.target = '' as any;
                    return;
                }
            }

            let rampart = _.min(room.ramparts, rampart => {
                let creep = rampart.pos.lookFor(LOOK_CREEPS)[0];
                let walkable = rampart.pos.isWalkable(true);
                return (creep && creep.id != this.creep.id || !walkable) ? Infinity : rampart.pos.getRangeTo(target as any);
            });

            if(this.creep.pos.inRangeTo(target, 1)) {
                this.timeOut = 0;
                // if(Tower.aimAt(room, target)) {
                    this.creep.rangedAttack(target);
                    this.checkWhenNextTick = true;
                    this.checkHit = target.hits;
                // }
                return;
            }

            if(!this.creep.pos.isEqualTo(rampart)) {
                this.creep.travelTo(rampart);
                return;
            }

            if(!this.creep.pos.inRangeTo(target, 1)) {
                if(this.timeOut >= 10) {
                    this.timeOut = 0;
                    this.target = '' as any;
                    RoleRange.blackList[target.id] = Game.time + 10;
                }
                this.timeOut++;
            }
        }
    }
}