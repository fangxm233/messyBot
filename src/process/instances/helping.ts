import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { CreepWish } from "../../programs/creepWish";
import Tasks from 'creep-tasks'
import { SourceManager } from "../../programs/sourceManager";

@profile
export class ProcessHelping extends Process {
    memory: ProcessHelpingInterface;
    targetRoom: string;
    sourceRoom: string;
    creepNum: number;

    constructor(roomName: string, targetRoom: string, sourceRoom: string, creepNum: number) {
        super(roomName, 'helping');
        this.targetRoom = targetRoom;
        this.sourceRoom = sourceRoom;
        this.creepNum = creepNum;
    }

    static getInstance(struct: ProcessHelpingInterface, roomName: string): ProcessHelping {
        return new ProcessHelping(roomName, struct.targetRoom, struct.sourceRoom, struct.creepNum);
    }

    run() {
        let hasFlag =
            _.filter(Game.flags, flag => flag.pos.roomName == this.targetRoom && flag.name.match(this.roomName) && flag.name.match('hp')).length > 0;

        if (!hasFlag) {
            this.close();
            return;
        }

        this.foreachCreep(() => { });
        if (this.creeps.length < this.creepNum) CreepWish.wishCreep(this.roomName, '好人', this.fullId);
        this.foreachCreep(creep => this.runCreep(creep));
    }

    getStruct(): ProcessAttackControllerInterface {
        return _.merge(super.getStruct(), { targetRoom: this.targetRoom, creepNum: this.creepNum, sourceRoom: this.sourceRoom });
    }

    close() {
        this.foreachCreep(creep => creep.suicide());
        super.close();
    }

    runCreep(creep: Creep) {
        if ((creep.isIdle && !creep.store.energy && creep.room.name != this.sourceRoom && creep.room.name != this.targetRoom) || (creep.store.energy && creep.room.name != this.targetRoom) || creep.pos.isEdge) {
            creep.travelTo(new RoomPosition(25, 25, this.targetRoom), { preferHighway: true });
            return;
        }

        if (creep.isIdle) this.chooseWork(creep);
        if (creep.task) creep.task.run();
    }

    chooseWork(creep: Creep) {
        if (creep.store.energy > 0) {
            let repairList = _.filter(creep.room.structures, structure => structure.structureType != STRUCTURE_RAMPART
                && structure.structureType != STRUCTURE_WALL && structure.hits < structure.hitsMax * 0.2);
            if (repairList.length)
                if (this.repairAction(creep, repairList)) return;

            let buildSites = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (buildSites.length)
                if (this.buildAction(creep, buildSites)) return;
        } else {
            let hasSource = SourceManager.getSource(creep, false);
            if (hasSource) return;
            if (creep.room.name != this.sourceRoom || creep.pos.isEdge) {
                creep.travelTo(new RoomPosition(25, 25, this.sourceRoom));
                return;
            }

            let sources = creep.room.find(FIND_SOURCES).filter(s => s.energy && s.targetedBy.length < s.pos.availableNeighbors(true, false).length)
            let source = creep.pos.findClosestByRange(sources);
            if (source) {
                creep.task = Tasks.harvest(source);
            }
        }
    }

    buildAction(creep: Creep, buildSites: ConstructionSite[]): boolean {
        if (!buildSites.length) return false;
        let target = creep.pos.findClosestByMultiRoomRange(buildSites);
        if (!target) return false;
        creep.task = Tasks.build(target);
        return true;
    }

    repairAction(creep: Creep, repairList: Structure[]): boolean {
        if (!repairList.length) return false;
        let target = creep.pos.findClosestByRange(repairList);
        if (!target) return false;
        creep.task = Tasks.repair(target);
        return true;
    }
}
