import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { getTargetBodyPart } from "../../utils";
import { RoomPlanner } from "../../roomPlanner/RoomPlanner";

export let compoundOrder = [
    // 'XLHO2', 'XGHO2', 'XZHO2','XZH2O','XUH2O', 'XKHO2', 'XGH2O', 'XLH2O', 'XUHO2', 'XKH2O'
    'XGH2O', 'XLHO2', 'XGHO2', 'XZHO2','XZH2O','XUH2O', 'XKHO2', 'XLH2O', 'XUHO2', 'XKH2O'
];

@profile
export class ProcessBoost extends Process {
    memory: ProcessBoostInterface;
    
    compoundTypes: MineralBoostConstant[];
    creepName: string;
    processId: string;

    boostState: 'waiting' | 'filling' | 'boosting' | 'withdrawing' | 'done';

    public setBoostState(state: 'waiting' | 'filling' | 'boosting' | 'withdrawing' | 'done') {
        this.boostState = state;
        this.memory.boostState = state;
    }

    static enoughToBoost(roomName: string, compoundTypes: MineralBoostConstant[], creep: Creep | BodyPartConstant[]): boolean{
        let room = Game.rooms[roomName];
        if(!room) return false;
        let terminal = room.terminal;
        if(!terminal) return false;
        let rp = new RoomPlanner(roomName);
        let labs = rp.getLabs();
        
        for (const compound of compoundTypes) {
            let part = getTargetBodyPart(compound);
            let partCount = 0;
            if(creep instanceof Creep) {
                partCount = creep.bodyCounts[part] - (creep.boostedBodyCounts[part] || 0);
            }
            else {
                partCount = _.countBy(creep)[part];
            }
            let labStore = 0;
            let index = compoundOrder.findIndex(c => c == compound);
            if(index != -1) {
                let lab = labs[index];
                if(lab && lab.mineralType == compound) labStore = lab.store[compound] || 0;
            }
            if((terminal.store[compound] || 0) + labStore < partCount * 30) return false;
        }    
        return true;
    }

    constructor(roomName: string, compoundTypes: MineralBoostConstant[], creepName: string, processId?: string) {
        super(roomName, 'boost');
        this.compoundTypes = compoundTypes;
        this.creepName = creepName;
        this.processId = processId || '';
        this.boostState = 'waiting';
    }

    static getInstance(struct: ProcessBoostInterface, roomName: string): ProcessBoost {
        let process = new ProcessBoost(roomName, struct.ct, struct.creep, struct.processId);
        process.boostState = struct.boostState;
        return process;
    }

    run() {
        if(this.boostState == 'done') {
            this.close();
            return;
        }

        let creep = Game.creeps[this.creepName];
        if(!creep) {
            this.setBoostState('withdrawing');
            return;
        }
        let rp = new RoomPlanner(this.roomName);
        if(rp.getLabs().length < this.compoundTypes.length) {
            this.close();
            return;
        }

        if(this.boostState == 'waiting' && !creep.spawning) this.setBoostState('filling');

        let pos = this.getBoostPos(creep, this.compoundTypes, rp)
        if(this.boostState == 'filling') {
            if(!creep.pos.inRangeTo(pos, 4)) {
                creep.travelTo(pos);
            }
            return;
        }

        if(this.boostState == 'withdrawing') return;

        if(!creep.pos.isEqualTo(pos)) {
            creep.travelTo(pos, {repath: 0.5});
            return;
        }

        let labs = rp.getLabs().filter(lab => lab.pos.inRangeTo(creep, 1) && lab.energy);
        labs.forEach(lab => lab.boostCreep(creep));
        this.setBoostState('withdrawing');

        // Give back the creep ahead of time but close after withdraw is finished.
        let process = Process.getProcess(this.processId);
        if(process) {
            process.boostedCreep(this.creepName, this.compoundTypes);        
        }
    }

    getBoostPos(creep: Creep, compoundTypes: MineralBoostConstant[], roomPlanner: RoomPlanner) {
        for (let i = 0; i < compoundOrder.length; i++) {
            const compound = compoundOrder[i];
            if(_.contains(compoundTypes, compound) && !creep.boostCounts[compound]) {
                let pos = roomPlanner.getBoostPos();
                if(i > 5) return new RoomPosition(pos.x + 1, pos.y - 1, pos.roomName);
                else return pos;
            }
        }
        return roomPlanner.getBoostPos();
    }

    getStruct(): ProcessBoostInterface{
        return _.merge(super.getStruct(), {ct: this.compoundTypes, creep: this.creepName, boostState: this.boostState, processId: this.processId})
    }
}