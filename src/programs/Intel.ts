import { profile } from "../profiler/decorator";
import { RoomPlanner } from "../roomPlanner/RoomPlanner";

export const intel:{
    [roomName: string]:{
        time: number;
        crossRoom: boolean;
        powerBank?: {
            ticks: number;
            amount: number;
            hits: number;
        }
        ruin?: {
            ticks: number;
        }
        deposit?: {
            ticks: number;
            cooldown: number;
            type: DepositConstant;
        }
        sources?: RoomPosition[];
        mineral?: {
            type: MineralConstant;
            pos: RoomPosition;
        }
        dropPower: boolean;

        buildingCostMatrix: CostMatrix;
    }
} = {};

export const powerRegion: { [roomName: string]: string[] } = {
    E51N21: ['E55N20', 'E54N20', 'E53N20', 'E52N20', 'E51N20'],
    E49N19: ['E50N17', 'E50N18', 'E50N19', 'E50N20'],
    E49N22: ['E49N20', 'E48N20', 'E47N20', 'E50N21', 'E50N22', 'E50N23', 'E50N24', 'E50N25', 'E50N26'],
    W3N8: ['W0N9']
}

export const depositRegion: { [roomName: string]: string[] } = {
    E51N21: ['E55N20', 'E54N20', 'E53N20', 'E52N20', 'E51N20'],
    E49N19: ['E50N17', 'E50N18', 'E50N19', 'E50N20'],
    E49N22: ['E49N20', 'E48N20', 'E47N20', 'E50N21', 'E50N22', 'E50N23', 'E50N24', 'E50N25', 'E50N26', 'E50N27', 'E50N28', 'E50N29'],
    E44N19: ['E37N20', 'E38N20', 'E39N20', 'E40N20', 'E41N20', 'E42N20', 'E43N20', 'E44N20', 'E45N20', 'E46N20', 'E40N23', 'E40N22', 'E40N21'],
    E23N41: ['E17N40', 'E18N40', 'E19N40', 'E20N40', 'E21N40', 'E22N40', 'E23N40', 'E24N40', 'E25N40', 'E26N40', 'E27N40', 'E28N40', 'E29N40',
             'E20N36', 'E20N37', 'E20N38', 'E20N39', 'E20N41', 'E20N42', 'E20N43', 'E20N44', 'E20N45',],
}

@profile
export class Intel{
    static run(){
        let observers: StructureObserver[] = [];

        for (const roomName in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomName)) {
                const room = Game.rooms[roomName];

                if(room.controller && room.controller.my){
                    if(room.observer) observers.push(room.observer);
                }

                if(!intel[roomName]) intel[roomName] = { time: Game.time } as any;
                let info = intel[roomName];
                if(!info.buildingCostMatrix || Game.time - info.time > 1000){
                    info.buildingCostMatrix = new RoomPlanner(roomName).generateBuildingCostMarix();
                    info.time = Game.time;
                }
                intel[roomName] = { time: info.time, buildingCostMatrix: info.buildingCostMatrix } as any;
                info = intel[roomName];

                info.sources = _.map<Source, RoomPosition>(room.find(FIND_SOURCES), 'pos');
                let mineral = room.find(FIND_MINERALS)[0];
                if(mineral){
                    info.mineral = { type: mineral.mineralType, pos: mineral.pos };
                }

                let coord = room.coord;
                if(coord.x % 10 == 0 || coord.y % 10 == 0){
                    let pb = room.powerBanks[0];
                    let dropPower = room.find(FIND_DROPPED_RESOURCES, { filter: drop => drop.resourceType == RESOURCE_POWER }).length > 0;
                    let ruin = room.find(FIND_RUINS, { filter: ruin => !!ruin.store.power })[0];
                    let deposit = room.find(FIND_DEPOSITS)[0];

                    info.crossRoom = true;
                    info.dropPower = dropPower;
                    
                    if(pb) info.powerBank = { ticks: pb.ticksToDecay, amount: pb.power, hits: pb.hits };
                    if(ruin) info.ruin = { ticks: ruin.ticksToDecay };
                    if(deposit) info.deposit = { ticks: deposit.ticksToDecay, cooldown: deposit.lastCooldown, type: deposit.depositType };
                }
            }
        }

        if(observers.length == 0) return;
        let dealList: string[] = [];
        for (const roomName in powerRegion) {
            const powerRooms = powerRegion[roomName];
            dealList.push(...powerRooms);
        }
        for (const roomName in depositRegion) {
            const depositRooms = depositRegion[roomName];
            dealList.push(...depositRooms);
        }

        _.remove(dealList, roomName => intel[roomName] && Game.time - intel[roomName].time < 200);
        dealList = _.uniq(dealList);

        for (const roomName of dealList) {
            if(observers.length == 0) return;
            let observer = this.getSuitableObserver(observers, roomName);
            if(observer){
                observer.observeRoom(roomName);
                _.pull(observers, observer);
            }
        }
    }

    private static getSuitableObserver(observers: StructureObserver[], roomName: string): StructureObserver | undefined{
        for (const observer of observers) {
            if(new RoomPosition(25, 25, observer.room.name).getRoomRangeTo(new RoomPosition(25, 25, roomName)) <= 10) return observer;
        }
        return;
    }
}