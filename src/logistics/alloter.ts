import { profile } from "../profiler/decorator";

export const ALLOT_HARVEST = 0;
export const ALLOT_TRANSPORT = 1;
export const ALLOT_LINK = 2;
export const ALLOT_RESERVE = 3;
export const ALLOT_TOWER = 4;
export const ALLOT_MINERAL_TRANSPORT = 5;
export const ALLOT_FILLER = 6;

type AllotType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

@profile
export class Alloter{
    static AddType(type: AllotType, room: string): void{
        if(!Memory.rooms[room]) Memory.rooms[room] = {} as any;
        if(!Memory.rooms[room].allot) Memory.rooms[room].allot = {};
        Memory.rooms[room].allot[type] = [];
    }
    
    static removeType(type: AllotType, room: string): void{
        if(!Memory.rooms[room]) return;
        if(!Memory.rooms[room].allot) return;
        delete Memory.rooms[room].allot[type];
    }

    static addUnit(unit: allotUnit, type: AllotType): number{
        let room = unit.roomName;
        if(!Memory.rooms) Memory.rooms = {};
        if(!Memory.rooms[room]) Memory.rooms[room] = {} as any;
        if(!Memory.rooms[room].allot) Memory.rooms[room].allot = {};
        if(!Memory.rooms[room].allot[type]) Memory.rooms[room].allot[type] = [];
        unit.id = Memory.rooms[room].allot[type].push(unit) - 1;
        unit.available = false;
        unit.typeId = type;
        return unit.id;
    }

    static removeUnit(unit: allotUnit): void{
        if(!Memory.rooms[unit.roomName]) return;
        if(!Memory.rooms[unit.roomName].allot) return;
        if(!Memory.rooms[unit.roomName].allot[unit.typeId]) return;
        delete Memory.rooms[unit.roomName].allot[unit.typeId][unit.id];
    }

    static getUnitWithKeyValue(type: AllotType, room: string, key: string, value: any): allotUnit | undefined{
        if(!Memory.rooms[room]) return;
        if(!Memory.rooms[room].allot) return;
        if(!Memory.rooms[room].allot[type]) return;
        for (const allotUnit of Memory.rooms[room].allot[type]) 
            if(allotUnit.data[key] == value) return allotUnit;
        return;
    }


    static allot(type: AllotType, room: string): allotUnit | undefined {
        if(!Memory.rooms[room]) return;
        if(!Memory.rooms[room].allot) return;
        if(!Memory.rooms[room].allot[type]) return;
        let allot = Memory.rooms[room].allot[type];
        for (const unit of allot) {
            if(!unit) continue;
            if(unit.available){
                unit.available = false;
                unit.dirty = false;
                return unit;
            }
        }
        return;
    }

    static allotSmallestByRange(type: AllotType, room: string, pos: RoomPosition): allotUnit | undefined{
        if(!Memory.rooms[room]) return;
        if(!Memory.rooms[room].allot) return;
        if(!Memory.rooms[room].allot[type]) return;
        let allot = Memory.rooms[room].allot[type];
        let result, dis = 9999;
        for (const unit of allot) {
            if(!unit) continue;
            if(!unit.data.pos) return;
            if(unit.available){
                if(pos.getMultiRoomRangeTo(new RoomPosition(unit.data.pos.x, unit.data.pos.y, unit.data.pos.roomName)) < dis){
                    result = unit;
                    dis = pos.getMultiRoomRangeTo(new RoomPosition(unit.data.pos.x, unit.data.pos.y, unit.data.pos.roomName));
                }
            }
        }
        if(result){
            result.available = false;
            result.dirty = false;
        }
        return result;
    }

    static allotSmallestByKey(type: AllotType, room: string, key: string): allotUnit | undefined{
        if(!Memory.rooms[room]) return;
        if(!Memory.rooms[room].allot) return;
        if(!Memory.rooms[room].allot[type]) return;
        let allot = Memory.rooms[room].allot[type];
        let result, s_value = Number.MAX_VALUE;
        for (const unit of allot) {
            if(!unit) continue;
            if(!unit.data[key]) return;
            if(unit.available){
                if(unit.data[key] < s_value){
                    result = unit;
                    s_value = unit.data[key];
                }
            }
        }
        if(result){
            result.available = false;
            result.dirty = false;
        }
        return result;
    }

    static free(unit: allotUnit){
        if(!unit) return;
        if(!Memory.rooms[unit.roomName]) return;
        if(!Memory.rooms[unit.roomName].allot) return;
        if(!Memory.rooms[unit.roomName].allot[unit.typeId]) return;
        if(!Memory.rooms[unit.roomName].allot[unit.typeId][unit.id]) return;
        Memory.rooms[unit.roomName].allot[unit.typeId][unit.id].available = true;
        Memory.rooms[unit.roomName].allot[unit.typeId][unit.id].dirty = true;
    }

    static getUnitCount(type: AllotType, room: string): number {
        if(!Memory.rooms[room]) return -1;
        if(!Memory.rooms[room].allot) return -1;
        if(!Memory.rooms[room].allot[type]) return -1;
        let count = 0;
        _.forEach(Memory.rooms[room].allot[type], element => {if(element) count++;})
        return count;
    }

    static exist(type: AllotType, room: string, key: string, value: any): boolean{
        if(!Memory.rooms[room]) return false;
        if(!Memory.rooms[room].allot) return false;
        if(!Memory.rooms[room].allot[type]) return false;
        for (const allotUnit of Memory.rooms[room].allot[type]) 
            if(allotUnit && allotUnit.data[key] == value) return true;
        return false;
    }

    static refreshDirty(unit: allotUnit): void{
        // console.log('start refresh!')
        // console.log(JSON.stringify(unit));
        if(!Memory.rooms[unit.roomName]) return;
        if(!Memory.rooms[unit.roomName].allot) return;
        if(!Memory.rooms[unit.roomName].allot[unit.typeId]) return;
        if(!Memory.rooms[unit.roomName].allot[unit.typeId][unit.id]) return;
        Memory.rooms[unit.roomName].allot[unit.typeId][unit.id].dirty = false;
        Memory.rooms[unit.roomName].allot[unit.typeId][unit.id].available = false;
        // console.log('refresh succeed!')
    }

    static setDirty(){
        for (const room in Memory.rooms) {
            if(Memory.rooms[room].allot){
                for (const t in Memory.rooms[room].allot) {
                    const units = Memory.rooms[room].allot[t];
                    for (const unit of units) {
                        if(!unit) continue;
                        unit.dirty = true;
                    }
                }
            }
        }
    }

    static checkDirty(){
        for (const room in Memory.rooms) {
            if(Memory.rooms[room].allot){
                for (const t in Memory.rooms[room].allot) {
                    const units = Memory.rooms[room].allot[t];
                    for (const unit of units) {
                        if(!unit) continue;
                        unit.available = unit.dirty;
                    }
                }
            }
        }
    }
}

export class allotUnit{
	available: boolean;
	dirty: boolean;
	roomName: string;
	typeId: number;
	id: number;
	data: any;
    
    constructor(roomName: string, data: any){
        this.roomName = roomName;
        this.data = data;
    }
}
