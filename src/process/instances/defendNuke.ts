import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { ProcessRepair } from "./repair";
import { Processes } from "../processes";

@profile
export class ProcessDefendNuke extends Process{

    constructor(roomName: string){
        super(roomName, 'defendNuke');
    }

    static getInstance(struct: ProcessInterface, roomName: string): ProcessDefendNuke{
        return new ProcessDefendNuke(roomName);
    }

    check() {
        if(Game.time % 100 == 0) {
            let room = Game.rooms[this.roomName];
            if(!room || !room.find(FIND_NUKES).length) this.close();
        }
        return false;
    }

    run() {
        let room = Game.rooms[this.roomName];
        if(!room) {
            this.close();
            return;
        }

        let processRepair = Process.getProcess(this.roomName, 'repair') as ProcessRepair;
        if(!processRepair) Processes.processRepair(this.roomName, 'defend');
        else if(processRepair.type == 'normal') processRepair.setType('defend');

        this.suspend();
    }
}