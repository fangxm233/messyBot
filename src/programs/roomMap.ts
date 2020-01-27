import { profile } from "../profiler/decorator";

interface Intel{
    time: number;
    crossRoom: boolean;
    powerBank: {
        ticks: number;
        amount: number;
        hits: number;
    }
    terrain: RoomTerrain;
    sources: SourceIntel[];
    mineral: MineralIntel;
}

interface SourceIntel{
    id: string;
    pos: RoomPosition;
}

interface MineralIntel{
    id: string;
    pos: RoomPosition;
    type: MineralConstant;
}

@profile
export class RoomIntel{
    static intel:{
        [roomName: string]: Intel | undefined;
    }

    static run(){
        for (const roomName in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomName)) {
                const room = Game.rooms[roomName];
                let coord = room.coord;
                if(coord.x % 10 == 0 && coord.y % 10 == 0){
                    
                }
            }
        }
    }

    static getIntel(roomName: string): Intel | undefined{
        return RoomIntel.intel[roomName];
    }

    static refreshIntel(roomName: string): Intel | undefined{
        let room = Game.rooms[roomName];
        if(!room) return;
        
    }
}