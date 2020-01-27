import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { getTargetBodyPart } from "../../utils";
import { RoomPlanner } from "../../roomPlanner/RoomPlanner";

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
        
        for (const compound of compoundTypes) {
            let part = getTargetBodyPart(compound);
            let partCount = 0;
            if(creep instanceof Creep) {
                partCount = creep.bodyCounts[part] - (creep.boostedBodyCounts[part] || 0);
            }
            else {
                partCount = _.countBy(creep)[part];
            }
            if((terminal.store[compound] || 0) < partCount * 30) return false;
        }    
        return true;
    }

    constructor(roomName: string, compoundTypes: MineralBoostConstant[], creepName: string, processId: string) {
        super(roomName, 'boost');
        this.compoundTypes = compoundTypes;
        this.creepName = creepName;
        this.processId = processId;
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
        }
        let rp = new RoomPlanner(this.roomName);

        if(this.boostState == 'waiting' && !creep.spawning) this.setBoostState('filling');

        if(this.boostState == 'filling') {
            if(!creep.pos.inRangeTo(rp.getBoostPos(), 4)) {
                creep.travelTo(rp.getBoostPos());
            }
            return;
        }

        if(this.boostState == 'withdrawing') return;

        if(!creep.pos.isEqualTo(rp.getBoostPos())) {
            creep.travelTo(rp.getBoostPos(), {repath: 0.5});
            return;
        }

        let labs = rp.getLabs().filter(lab => lab.pos.inRangeTo(creep, 1) && lab.energy);
        labs.forEach(lab => lab.boostCreep(creep));
        this.setBoostState('withdrawing');

        // Give back the creep ahead of time but close after withdraw is finished.
        let process = Process.getProcess(this.processId);
        if(!process) {
            this.close();
            return;
        }
        process.boostedCreep(this.creepName, this.compoundTypes);
    }

    getStruct(): ProcessBoostInterface{
        return _.merge(super.getStruct(), {ct: this.compoundTypes, creep: this.creepName, boostState: this.boostState, processId: this.processId})
    }
}