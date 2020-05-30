import { SourceManager } from "../programs/sourceManager";
import { Alloter, ALLOT_FILLER } from "../logistics/alloter";
import { profile } from "../profiler/decorator";
import { RoomPlanner } from "../roomPlanner/RoomPlanner";
import { Role } from "./role";

@profile
export class RoleFiller extends Role {
    static actionOrder: {
        [roomName: string]: {
            [index: number]: FillingAction[];
        }
    }

    run() {
        let memory = this.creep.memory;
        if(!memory.allotUnit) Alloter.allot(ALLOT_FILLER, this.creep.room.name);
        if(!memory.allotUnit) return;        
        if(!(this.creep.ticksToLive && this.creep.ticksToLive <= this.creep.body.length * 3))
            Alloter.refreshDirty(memory.allotUnit);
        if(!this.creep.ticksToLive) return;
        if(this.creep.room.energyAvailable == this.creep.room.energyCapacityAvailable && memory.sleep) return;
        let allot = memory.allotUnit;
        let roomName = this.creep.room.name;
        let room = this.creep.room;
        let id = allot.id;
        if(!RoleFiller.actionOrder) RoleFiller.actionOrder = {};
        if(!RoleFiller.actionOrder[roomName]) RoleFiller.actionOrder[roomName] = {} as any;

        let rp = new RoomPlanner(roomName);
        let order = RoleFiller.actionOrder[roomName][id];
        if(room.energyAvailable < room.energyCapacityAvailable){
            memory.sleep = false;
            if(!order) {
                order = rp.getActionOrder(id);
                RoleFiller.actionOrder[roomName][id] = order
            } else this.refresh(order);
            
            let index = this.hasUnfull(order, 0, order.length);
            if(index == -1){
                order = rp.getActionOrder(id);
                RoleFiller.actionOrder[roomName][id] = order
            }
            memory.targetIndex = index;
        } else memory.targetIndex = -1;
        if (memory.targetIndex != -1) {
            let index = memory.targetIndex;
            let action = order[index];
            let structure = action.structure;
            if(!structure) throw new Error('filler exception!');
            if(this.creep.pos.isNearTo(structure)) this.creep.transfer(structure, RESOURCE_ENERGY);
            if(this.creep.store.energy <= structure.store.getFreeCapacity(RESOURCE_ENERGY) && this.creep.store.energy < this.creep.store.getCapacity())
                this.creep.room.memory.noEnergyAvailable = !SourceManager.getSource(this.creep, true); //todo op
            else if(!this.creep.pos.isNearTo(structure)) this.creep.travelTo(rp.toRoomPos(rp.getPosByRegion(id, this.getStandPos(index))));
            
            if(order[index + 1] && order[index + 1].pos && this.hasUnfull(order, index + 1, order.length) != -1 && this.creep.store.energy >= structure.store.getFreeCapacity(RESOURCE_ENERGY)){
                let pos = order[index + 1].pos;
                if(pos) this.creep.travelTo(rp.toRoomPos(pos));
            }
        }
        else{
            let container = this.getContainer(rp, id);
            // if(memory.id == 7) console.log(container)
            if(!container) return;
            if(this.creep.store.energy < this.creep.store.getCapacity() * 0.5){
                let remain = this.creep.store.getFreeCapacity();
                SourceManager.getSource(this.creep, container.energy - remain >= 1100);
                return;
            }
            if(container.energy < 1100){
                if(this.creep.pos.isNearTo(container)) this.creep.transfer(container, RESOURCE_ENERGY);
                else this.creep.travelTo(container);
                return;
            }
            let pos = rp.toRoomPos(rp.getPosByRegion(id, {x: 3, y: 9}));
            // if(memory.id == 7) console.log(rp.toRoomPos(pos))
            if(!pos.isEqualTo(this.creep.pos)) this.creep.travelTo(pos);
            else memory.sleep = true;
        }
    }

    refresh(order: FillingAction[]): FillingAction[]{
        return _.map(order, action => {
            if(action.structure) action.structure = Game.getObjectById<(StructureSpawn | StructureExtension)>(action.structure.id) as any;
            return action;
        });
    }

    hasUnfull(order: FillingAction[], from: number, to: number): number{
        for (let i = from; i < to; i++) {
            if(i >= order.length) return -1;
            const element = order[i];
            if(!element.structure) continue;
            if(element.structure.store.getFreeCapacity(RESOURCE_ENERGY)) return i;
        }
        return -1;
    }

    getStandPos(index: number): {x: number, y: number}{
        let pos = {x: 0, y: 0};
        if(index <= 6) pos = {x: 3, y: 9};
        else if(index == 8) pos = {x: 2, y: 8};
        else if(index <= 13) pos = {x: 1, y: 9};
        else if(index == 15) pos = {x: 2, y: 8};
        else if(index <= 20) pos = {x: 1, y: 7};
        return pos;
    }

    getContainer(rp: RoomPlanner, id: number): StructureContainer | undefined{
        if(this.creep.memory.containerId){
            let conteiner = Game.getObjectById<StructureContainer>(this.creep.memory.containerId);
            if(conteiner) return conteiner;
        }
        let conteiner = rp.getFillerContainer(id);
        if(conteiner) this.creep.memory.containerId = conteiner.id;
        return conteiner;
    }

    getSource(){

    }
}