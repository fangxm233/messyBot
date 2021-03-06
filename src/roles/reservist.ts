import { Role } from "./role";
import { Alloter, ALLOT_RESERVE } from "../logistics/alloter";
import { SourceManager } from "../programs/sourceManager";
import { profile } from "../profiler/decorator";

@profile
export class RoleReservist extends Role {
    run() {
        if(this.creep.memory.allotUnit) Alloter.refreshDirty(this.creep.memory.allotUnit);
        else this.creep.memory.allotUnit = SourceManager.allotReservist(Game.rooms[this.creep.memory.spawnRoom]);
        if(!this.creep.memory.allotUnit) return;
        var targetRoom = this.creep.memory.allotUnit.data.name;
        // if (!this.creep.memory.targetRoom) {
        //     let smallest: StructureController = {} as StructureController;
        //     let name = '';
        //     for (const room of Memory.colonies[this.creep.memory.spawnRoom]) {
        //         if(Memory.rooms[room.name].underAttacking) continue;
        //         if (!Game.rooms[room.name]) {
        //             this.creep.memory.targetRoom = room.name;
        //             targetRoom = room.name;
        //             break;
        //         }
        //         let controller = Game.rooms[room.name].controller;
        //         if(!controller) continue;
        //         if(!smallest.reservation) {
        //             smallest = controller;
        //             name = room.name;
        //         }
        //         if (!controller.reservation) {
        //             this.creep.memory.targetRoom = room.name;
        //             targetRoom = room.name;
        //             break;
        //         }
        //         if(smallest.reservation && controller.reservation.ticksToEnd < smallest.reservation.ticksToEnd){
        //             smallest = controller;
        //             name = room.name;
        //         }
        //     }
        //     if(smallest && !targetRoom)
        //         this.creep.memory.targetRoom = name;
        // }
        if (!Game.rooms[targetRoom]) {
            this.creep.travelTo(new RoomPosition(25, 25, targetRoom), {allowHostile: false});
            return;
        }
        else if (this.creep.room.name != targetRoom) {
            let controller = Game.rooms[targetRoom].controller;
            if(controller)
                this.creep.travelTo(controller, {allowHostile: false});
            return;
        }
        if(this.creep.room.controller && this.creep.room.controller.reservation){
            let unit = Alloter.getUnitWithKeyValue(ALLOT_RESERVE, this.creep.memory.spawnRoom, 'name', this.creep.room.name);
            if(unit) unit.data.ticksToEnd = this.creep.room.controller.reservation.ticksToEnd;
        }
        if(this.creep.room.controller){
            if(this.creep.room.controller.reservation && this.creep.room.controller.reservation.ticksToEnd >= 4999) {
                delete this.creep.memory.allotUnit;
            }
            else {
                if(this.creep.pos.isNearTo(this.creep.room.controller)) {
                    this.creep.reserveController(this.creep.room.controller);
                    if((this.creep.room.controller.sign || {text: ''}).text != '⛏') this.creep.signController(this.creep.room.controller, '⛏')
                } else this.creep.travelTo(this.creep.room.controller, {allowHostile: false})
            }
        }
    }
}