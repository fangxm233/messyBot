import { Role } from "../role";
import { profile } from "../../profiler/decorator";
import { ProcessAttack, healerNumPerGroup } from "../../process/instances/attack";
import { Traveler } from "../../programs/Traveler";
import { wouldBreakDefend, possibleTowerDamage, possibleDamage, possibleHealHits } from "../../utils";
import { RoleFactory } from "../../roles/roleFactory";
import { RoleHealer } from "./healer";
import { USER_NAME } from "../../config";

@profile
export class RoleWarrior extends Role {
    process: ProcessAttack;

    finalTargetId: Id<Structure | ConstructionSite | Creep>;
    nowTargetId: Id<Structure | ConstructionSite | Creep>;

    healers: Creep[];

    axis: { x?: 'left' | 'right', y?: 'up' | 'down' };

    prepared = false;

    run() {
        let memory = this.creep.memory;
        let targetRoom = this.process.targetRoom;
        let room = Game.rooms[targetRoom];
        _.remove(memory.healerName, name => !Game.creeps[name]);
        this.healers = _.map(memory.healerName, name => Game.creeps[name]);
        if (this.healers.length < healerNumPerGroup && !this.prepared) return;
        this.prepared = true;

        let attacked = this.attack();

        if (!room || this.creep.room.name != this.process.targetRoom) {
            if (_.max(this.healers.map(healer => healer.pos.getMultiRoomRangeTo(this.creep.pos))) >
                (this.creep.room.name == this.process.roomName ? 15 : 3) && !this.creep.pos.isEdge) return;
            // if(!this.creep.pos.isEdge) this.process.travelTo(this.creep, new RoomPosition(25, 25, targetRoom), _.map(this.healers, healer => RoleFactory.getRole(healer) as RoleHealer), 1)
            // else
            this.creep.travelTo(new RoomPosition(25, 25, targetRoom), { preferHighway: true, stuckValue: 1 });
            let dir: DirectionConstant = _.get(this.creep.memory._trav, ['path', '0']);
            this.creep.say(dir + '');
            if (dir && this.creep.room.name != this.process.roomName) {
                this.healers.forEach(healer => {
                    let role = RoleFactory.getRole(healer) as RoleHealer;
                    if (role) role.go(dir);
                })
            }
            return;
        }

        if (this.creep.room.name == targetRoom && this.creep.pos.isEdge) {
            Traveler.avoidEdge(this.creep);
            return;
        }

        let flee = wouldBreakDefend(this.creep.body, this.creep.pos, USER_NAME, possibleTowerDamage(this.creep.room, this.creep.pos), true);
        if (flee) {
            this.creep.say('flee', true);
            if (_.max(this.healers.map(healer => healer.pos.getMultiRoomRangeTo(this.creep.pos))) > 2) return;
            let poses = this.creep.pos.availableNeighbors(true, false)
                .filter(pos => !pos.lookFor(LOOK_CREEPS).filter(creep => !_.contains(memory.healerName, creep.name)).length);
            let pos = _.min(poses, pos => possibleDamage(this.creep.body, pos, USER_NAME, false, possibleTowerDamage(this.creep.room, this.creep.pos), true));
            if (pos) {
                let dir = this.creep.pos.getDirectionTo(pos);
                this.creep.moveTo(pos);
                this.healers.forEach(healer => {
                    let role = RoleFactory.getRole(healer) as RoleHealer;
                    if (role) role.go(dir);
                })
            }
            return;
        }

        // console.log(this.finalTargetId, this.nowTargetId)
        let target: Structure | Creep | ConstructionSite | null = Game.getObjectById<Structure>(this.finalTargetId);
        if (!target) this.finalTargetId = '' as any;
        if (!this.finalTargetId) {
            let targets = this.process.getTargets(this.creep.pos, true);
            if (targets.length) target = _.min(targets, target => this.creep.pos.getRangeTo(target));
            if (!target) return;
            if (target == null) return;
            this.finalTargetId = target.id;
        }
        // if(!target) {
        //     let creep = this.creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        //     target = creep;
        // }
        if (!target) return;

        let nowTarget: Structure | ConstructionSite | Creep | null = Game.getObjectById<Structure>(this.nowTargetId);
        // if(!nowTarget) {
        //     this.nowTargetId = '' as any;
        //     nowTarget = target;
        // }
        if (!this.nowTargetId) {
            let result = PathFinder.search(this.creep.pos, { pos: target.pos, range: 0 }, { maxRooms: 1, roomCallback: roomName => ProcessAttack.hitsMatrix[roomName] });
            _.forEach(result.path, pos => {
                let structures = pos.lookFor(LOOK_STRUCTURES).filter(structure => !structure.isWalkable && !(structure as any).my);
                if (structures.length) {
                    nowTarget = structures[0];
                    this.nowTargetId = structures[0].id;
                    return false;
                }
                return;
            })
        }
        if (!nowTarget) nowTarget = target;

        if (attacked) return;
        let range = nowTarget instanceof ConstructionSite ? 0 : 1;
        // console.log(nowTarget)
        if (_.max(this.healers.map(healer => healer.pos.getMultiRoomRangeTo(this.creep.pos))) > 3) return;
        if (!this.creep.pos.inRangeTo(nowTarget, range) && !_.some(this.healers, healer => !!healer.fatigue)) {
            let dir: DirectionConstant = _.get(this.creep.memory._trav, ['path', '1']);
            let pos = Traveler.positionAtDirection(this.creep.pos, dir);
            if (pos) {
                let healers = pos.findInRange(FIND_CREEPS, 3, { filter: creep => creep.owner.username == USER_NAME && creep.bodyCounts[HEAL] });
                let ph = possibleHealHits(this.creep.pos, healers);
                let pd = possibleDamage(this.creep.body, pos, USER_NAME, false, possibleTowerDamage(this.creep.room, pos), true);
                if (ph < pd) {
                    this.creep.say('dangerous');
                    return;
                }
            }
            this.creep.travelTo(nowTarget, { range: range, repath: 0.5, ignoreCreeps: true, freshMatrix: true });
            if (dir) {
                this.healers.forEach(healer => {
                    let role = RoleFactory.getRole(healer) as RoleHealer;
                    if (role) role.go(dir);
                })
            }
        }

        else this.creep.rangedMassAttack();
    }

    attack(): boolean {
        let creeps = this.creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2).filter(creep => !creep.inRampart);
        if (creeps.length > 1) {
            this.creep.rangedMassAttack();
            return true;
        } else if (creeps.length == 1) {
            this.creep.rangedAttack(creeps[0]);
            return true;
        }
        return false;
    }
}
