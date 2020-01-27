import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { Traveler } from "../../programs/Traveler";
import { isOutOfRoom, hasAggressiveBodyParts } from "../../utils";
import { RoomPlanner } from "../../roomPlanner/RoomPlanner";
import { Porcesses } from "../processes";
import { ProcessRepair } from "./repair";
import { CreepWish } from "../../programs/creepWish";
import { ProcessBoost } from "./boost";
import { CreepManager } from "../../programs/creepManager";
import { RoleFactory } from "../../roles/roleFactory";
import { RoleMelee } from "../../roles/activeDefend/melee";

export const DANGEROUS_ZONE = 200;

@profile
export class ProcessActiveDefend extends Process{
    static costMatrixs: { [roomName: string]: CostMatrix } = {};

    memory: ProcessActiveDefendInterface;
    type: 'nuke' | 'creep';

    boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'};

    room: Room;
    invaders: Creep[] = [];

    constructor(roomName: string) {
        super(roomName, 'activeDefend');
        this.boostFlag = {};
    }

    static getInstance(struct: ProcessActiveDefendInterface, roomName: string) {
        let process = new ProcessActiveDefend(roomName);
        process.boostFlag = struct.boostFlag;
        return process;
    }

    registerCreep(creepName: string) {
        super.registerCreep(creepName);
        this.boostFlag[creepName] = 'none';
    }
    removeCreep(creepName: string) {
        super.removeCreep(creepName);
        delete this.boostFlag[creepName];
    }

    check() {
        this.foreachCreep(() => {});
        if(this.creeps.length == 0) this.close();
        if(Game.time % 5 == 0) {
            let room = Game.rooms[this.roomName];
            if(!room) {
                this.close();
                return false;
            }
            let invaders = room.find(FIND_HOSTILE_CREEPS, { filter: creep => hasAggressiveBodyParts(creep, false) });
            if(invaders.length) return true;
        }
        return false;
    }

    run() {
        this.room = Game.rooms[this.roomName];
        if(!this.room) {
            this.close();
            return;
        }
        this.invaders = this.room.find(FIND_HOSTILE_CREEPS, { filter: creep => hasAggressiveBodyParts(creep, false) });
        let nukes = this.room.find(FIND_NUKES);
        if(!this.invaders.length) {
            delete ProcessActiveDefend.costMatrixs[this.roomName];
            this.suspend();
            return;
        }

        this.refreshCostMatrix();

        let processRepair = Process.getProcess(this.roomName, 'repair') as ProcessRepair;
        if(!processRepair) Porcesses.processRepair(this.roomName, 'defend');
        else if(processRepair.type == 'normal') processRepair.setType('defend');
        
        let creepNum = this.invaders.length / 2;
        if(this.creeps.length < creepNum) CreepWish.wishCreep(this.roomName, 'melee', this.fullId, {}, 
            ProcessBoost.enoughToBoost(this.roomName, ['XUH2O', 'XZHO2'], CreepManager.prodictBodies(this.roomName, ['a4', 'm1'])) ? ['a4', 'm1'] : ['a1', 'm1']);
        
        this.foreachCreep((creep) => this.runCreep(creep));
    }

    runCreep(creep: Creep) {
        if(this.boostFlag[creep.name] == 'boosting') return;
        let role = RoleFactory.getRole(creep, creep => new RoleMelee(creep)) as RoleMelee;
        if(!creep.spawning && this.boostFlag[creep.name] == 'none' && !Process.getProcess(this.roomName, 'boost') 
            && ProcessBoost.enoughToBoost(this.roomName, ['XUH2O', 'XZHO2'], creep)) {
            Porcesses.processBoost(this.roomName, ['XUH2O', 'XZHO2'], creep.name, this.fullId);
            this.boostFlag[creep.name] = 'boosting';
            return;
        }
        role.run();
    }

    boostedCreep(creepName: string) {
        this.boostFlag[creepName] = 'boosted';
        this.memory.boostFlag[creepName] = 'boosted';
    }

    refreshCostMatrix() {
        let matrix = new PathFinder.CostMatrix();
        Traveler.addStructuresToMatrix(this.room, matrix, 1);

        this.invaders.forEach(creep => this.addSquare(matrix, {x: creep.pos.x, y: creep.pos.y}, creep.bodyCounts[RANGED_ATTACK] > 0 ? 3 : 1, DANGEROUS_ZONE));
        ProcessActiveDefend.costMatrixs[this.roomName] = matrix;
    }

    addSquare(matrix: CostMatrix, coord: Coord, range: number, value: number): CostMatrix{
        let rp = new RoomPlanner(this.roomName);
        for (let x = coord.x - range; x <= coord.x + range; x++) {
            for (let y = coord.y - range; y <= coord.y + range; y++) {
                if(isOutOfRoom({x: x, y: y})) continue;
                if(!rp.getForAt(STRUCTURE_RAMPART, x, y))
                    matrix.set(x, y, value);
            }
        }
        return matrix;
    }

    getStruct(): ProcessActiveDefendInterface {
        return _.merge(super.getStruct(), {boostFlag: this.boostFlag});
    }

    close() {
        this.foreachCreep(creep => creep.suicide());
        delete ProcessActiveDefend.costMatrixs[this.roomName];
        super.close();
    }
}