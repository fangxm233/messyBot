import { profile } from "../profiler/decorator";
import { commodities, Market } from "../extensions/market";
import { mulObject, addObject } from "../utils";

export const barIndustry: {
    [raw: string]: CommodityConstant;
} = {
    [RESOURCE_OXYGEN]: RESOURCE_OXIDANT,
    [RESOURCE_HYDROGEN]: RESOURCE_REDUCTANT,
    [RESOURCE_ZYNTHIUM]: RESOURCE_ZYNTHIUM_BAR,
    [RESOURCE_LEMERGIUM]: RESOURCE_LEMERGIUM_BAR,
    [RESOURCE_UTRIUM]: RESOURCE_UTRIUM_BAR,
    [RESOURCE_KEANIUM]: RESOURCE_KEANIUM_BAR,
    [RESOURCE_CATALYST]: RESOURCE_PURIFIER,
}

export const commoditiesRawList = [
    RESOURCE_ENERGY,
    RESOURCE_OXYGEN,
    RESOURCE_HYDROGEN,
    RESOURCE_ZYNTHIUM,
    RESOURCE_LEMERGIUM,
    RESOURCE_UTRIUM,
    RESOURCE_KEANIUM,
    RESOURCE_CATALYST,
    RESOURCE_GHODIUM,
    RESOURCE_METAL,
    RESOURCE_BIOMASS,
    RESOURCE_SILICON,
    RESOURCE_MIST
];

// 产各种等级商品的房间
export const levelRoom: {
    [level: number]: string
} = {
    1: 'E49N19',
    2: 'E44N19',
    3: 'E47N22',
    4: 'E51N21',
};

// 存量，你想卖哪个就把哪个填的很大
export const commoditiesStock: {
    [level: number]: number
} = {
    [1]: 100,
    [2]: 20,
    [3]: 10,
    [4]: 20,
}

@profile
export class Industry {

    static run() {
        if (!Memory.industry) Memory.industry = {};
        let rooms: Room[] = [];
        for (const roomName in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomName)) {
                const room = Game.rooms[roomName];
                if (room.controller && room.controller.my) rooms.push(room);
            }
        }

        if (this.getStock(RESOURCE_CONCENTRATE, levelRoom[1]) < commoditiesStock[1])
            this.produce(RESOURCE_CONCENTRATE, 75, levelRoom[1]);
        if (this.getStock(RESOURCE_EXTRACT, levelRoom[2]) < commoditiesStock[2])
            this.produce(RESOURCE_EXTRACT, 16, levelRoom[2]);
        // if(this.getStock(RESOURCE_BATTERY, 'E47N22') < 40000) this.produce(RESOURCE_BATTERY, 4000, 'E47N22');
        if (this.getStock(RESOURCE_SPIRIT, levelRoom[3]) < commoditiesStock[3])
            this.produce(RESOURCE_SPIRIT, 5, levelRoom[3]);
        //this.getStock(RESOURCE_EMANATION, levelRoom[4]) < commoditiesStock[4] &&
        if (this.getStock(RESOURCE_EMANATION, levelRoom[4]) < commoditiesStock[4])
            this.produce(RESOURCE_EMANATION, 2, levelRoom[4]);

        for (const room of rooms) {
            if (room.factory) {
                let factory = room.factory;
                if (Memory.industry[room.name]) {
                    let state = Memory.industry[room.name];
                    if (state.preparing) {
                        if (Industry.canProduce(state.type, state.amount, room.name)) {
                            console.log('Industry: room', room.name, 'produce', state.type, 'prepared, producing');
                            state.preparing = false;
                            state.producing = true;
                        }

                        for (const component in COMMODITIES[state.type].components) {
                            if (COMMODITIES[state.type].components.hasOwnProperty(component)) {
                                const num = COMMODITIES[state.type].components[component] / COMMODITIES[state.type].amount * state.amount -
                                    this.getStock(component as any, room.name);
                                if (num <= 0) continue;
                                if (commoditiesRawList.includes(component as any)) continue;
                                if (!Industry.isMatchLevel(component as any, room.name)) {
                                    let level = (COMMODITIES[component] as any).level;
                                    let roomName = levelRoom[level];
                                    if (Industry.getStock(component as any, roomName) >= num) {
                                        Industry.setTransport(component as any, num, roomName, room.name);
                                    }
                                } else {
                                    console.log(`Industry: room ${room.name} strange error, deleting current task`);
                                    Memory.industry[room.name] = undefined as any;
                                    let message = 'Industry: room ${room.name} strange error, deleting current task\n';
                                    message += `component: ${component}, missingNum: ${num}`;
                                    Game.notify(message);
                                    break;
                                }
                            }
                        }
                    }
                    if (state.producing) {
                        if (factory.cooldown == 0) {
                            let code = factory.produce(state.type);
                            if (code == OK) {
                                state.amount -= COMMODITIES[state.type].amount;
                                if (state.amount == 0) {
                                    console.log('Industry: room', room.name, 'product', state.type, 'finished');
                                    Memory.industry[room.name] = undefined as any;
                                }
                            }
                        }
                    }
                    // if(Industry.getStock(state.type, room.name) >= state.amount){
                    //     console.log('Industry: room', room.name, 'product', state.type, 'amount', state.amount, 'finished');
                    //     Memory.industry[room.name] = undefined as any;
                    // }
                } else {
                    let type = room.memory.mineral.type;
                    // let store = factory.store[type];
                    let terminal = room.terminal;
                    if (terminal) {
                        let tstore = terminal.store[type];
                        if (tstore >= 15000) {
                            this.setState(barIndustry[type], 1000, room.name);
                        }
                    }
                    // if(factory.cooldown == 0 && store && store >= 500 && factory.store.energy > 200) factory.produce(barIndustry[type]);
                }
            }
        }

        // Industry.produce(RESOURCE_EMANATION, 2, 'E51N21');
    }

    static produce(product: CommodityConstant, amount: number, roomName: string) {
        let room = Game.rooms[roomName];
        if (!room) return;
        let factory = room.factory;
        if (!factory) return;

        for (const component in COMMODITIES[product].components) {
            if (COMMODITIES[product].components.hasOwnProperty(component)) {
                const num = COMMODITIES[product].components[component] / COMMODITIES[product].amount * amount - this.getStock(component as any, roomName);
                if (num <= 0) continue;
                // if(roomName == 'E49N19') console.log('hello', roomName, component, product)
                if (commoditiesRawList.includes(component as any)) continue;
                if (Industry.isMatchLevel(component as any, roomName)) {
                    // let stock = Industry.getStock(component as any, roomName);
                    // if(stock < num){
                    Industry.produce(component as any, Industry.toWholeNumber(component as any, num), roomName)
                    // Industry.setState(component as any, Industry.toWholeNumber(component as any, num), roomName, true);
                    // }
                }
                // else {
                //     let level = (COMMODITIES[component] as any).level;
                //     let room = levelRoom[level];
                //     if(Industry.getStock(component as any, room) >= num){
                //         Industry.setTransport(component as any, num, room, roomName);
                //     }
                //     //  else {
                //     //     Industry.produce(component as any, Industry.toWholeNumber(component as any, num), room);
                //     // }
                // }
            }
        }

        Industry.setState(product, amount, roomName);
    }

    static setState(product: CommodityConstant, amount: number, roomName: string, cover: boolean = false) {
        if (!Memory.industry[roomName]) {
            console.log('Industry: room', roomName, 'start producing', product, 'amount:', amount);
            Memory.industry[roomName] = {
                type: product,
                amount: amount,
                preparing: true,
                producing: false
            };
            return;
        }
        // if(!Memory.industry[roomName].producing && cover){
        //     // console.log('Industry: room', roomName, 'start produce', product, 'amount:', amount);
        //     Memory.industry[roomName] = {
        //         type: product,
        //         amount: amount,
        //         preparing: true,
        //         producing: false
        //     };
        // }
    }

    static isMatchLevel(product: CommodityConstant, roomName: string): boolean {
        let level = (COMMODITIES[product] as any).level;
        if (!level) return true;
        return roomName == levelRoom[level];
    }

    static canProduce(product: CommodityConstant, amount: number, roomName: string): boolean {
        let room = Game.rooms[roomName];
        if (!room) return false;
        let factory = room.factory;
        if (!factory) return false;
        let canProduce = true;
        for (const component in COMMODITIES[product].components) {
            if (COMMODITIES[product].components.hasOwnProperty(component)) {
                const num = COMMODITIES[product].components[component];
                if ((factory.store[component] || 0) < (num / COMMODITIES[product].amount) * amount) canProduce = false;
            }
        }
        // console.log(product, amount, roomName, canProduce);
        return canProduce;
    }

    static setTransport(type: ResourceConstant, amount: number, from: string, to: string) {
        let market = Memory.market[from];
        if (!market || Market.hasOrder(from)) return;
        console.log('Industry: transport', type, 'amount', amount, 'from', from, 'to', to);
        Memory.market[from].transport = {
            type: type,
            des: to,
            amount: amount
        };
    }

    static getStock(resource: ResourceConstant, roomName: string): number {
        let room = Game.rooms[roomName];
        if (!room) return 0;
        let terminal = room.terminal;
        let storage = room.storage;
        let factory = room.factory;
        let store = 0;
        if (terminal) store += terminal.store[resource] || 0;
        if (storage) store += storage.store[resource] || 0;
        if (factory) store += factory.store[resource] || 0;
        let powerCreeps = room.find(FIND_MY_POWER_CREEPS);
        for (const powerCreep of powerCreeps) {
            store += powerCreep.store[resource] || 0;
        }
        return store;
    }

    static getAllRaw(product: CommodityConstant, count: number, endLevel: number): { [type in CommoditiesRaw]: number } {
        let result: { [type in CommoditiesRaw]: number } = {} as any;

        if (commoditiesRawList.includes(product as any) || endLevel && (COMMODITIES[product as any].level <= endLevel || !COMMODITIES[product as any].level)) {
            return { [product]: count } as any;
        }
        else {
            for (const component in COMMODITIES[product].components) {
                if (COMMODITIES[product].components.hasOwnProperty(component)) {
                    const componentNum = COMMODITIES[product].components[component];
                    result = addObject(result, Industry.getAllRaw(component as CommodityConstant, componentNum / COMMODITIES[product].amount * count, endLevel));
                }
            }
            return result;
        }
    }

    static toWholeNumber(product: CommodityConstant, count: number): number {
        if (commoditiesRawList.includes(product as any)) return count;
        return Math.ceil(count / COMMODITIES[product].amount) * COMMODITIES[product].amount;
    }
}
