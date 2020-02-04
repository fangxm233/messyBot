import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { CreepWish } from "../../programs/creepWish";

@profile
export class ProcessAttackController extends Process{
    memory: ProcessAttackControllerInterface;
    targetRoom: string;
    creepNum: number;

    constructor(roomName: string, targetRoom: string, creepNum: number) {
        super(roomName, 'attackController');
        this.targetRoom = targetRoom;
        this.creepNum = creepNum;
    }

    static getInstance(struct: ProcessAttackControllerInterface, roomName: string): ProcessAttackController {
        return new ProcessAttackController(roomName, struct.targetRoom, struct.creepNum);
    }

    run() {
        let hasFlag = 
            _.filter(Game.flags, flag => flag.pos.roomName == this.targetRoom && flag.name.match(this.roomName) && flag.name.match('ac')).length > 0;

        if(!hasFlag) {
            this.close();
            return;
        }

        this.foreachCreep(() => {});
        let room = Game.rooms[this.targetRoom];
        if(room) {
            let controller = room.controller;
            if(!controller) {
                this.close();
                return;
            }
        }
        if(this.creeps.length < this.creepNum) CreepWish.wishCreep(this.roomName, 'cAttack', this.fullId);
        this.foreachCreep(creep => this.runCreep(creep));

        if(room) {
            let controller = room.controller;
            if(controller && !controller.upgradeBlocked) {
                if(!_.some(this.creeps, creep => Game.creeps[creep].pos.getMultiRoomRangeTo((<any>controller).pos) > 1)) {
                    this.foreachCreep(creep => {
                        creep.attackController(controller as any);
                        creep.suicide()
                    });
                    this.sleep(600, true);
                    return;
                }
            }
        }
    }

    getStruct(): ProcessAttackControllerInterface{
        return _.merge(super.getStruct(), {targetRoom: this.targetRoom, creepNum: this.creepNum});
    }

    close() {
        this.foreachCreep(creep => creep.suicide());
        super.close();
    }

    runCreep(creep: Creep) {
        if(creep.room.name != this.targetRoom || creep.pos.isEdge) {
            creep.travelTo(new RoomPosition(25, 25, this.targetRoom), {preferHighway: true});
            return;
        }
        let controller = creep.room.controller;
        if(!controller) return;
        
        if(!creep.pos.isNearTo(controller)) {
            creep.travelTo(controller, {ignoreCreeps: false});
            return;
        }
    }
}