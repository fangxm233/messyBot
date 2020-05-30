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

export const barList = [
    RESOURCE_OXIDANT,
    RESOURCE_REDUCTANT,
    RESOURCE_ZYNTHIUM_BAR,
    RESOURCE_LEMERGIUM_BAR,
    RESOURCE_UTRIUM_BAR,
    RESOURCE_KEANIUM_BAR,
    RESOURCE_PURIFIER,
    RESOURCE_GHODIUM_MELT
]

export const level2Commodities: { [level: number]: CommodityConstant[] } = {
    [0]: [RESOURCE_WIRE, RESOURCE_CELL, RESOURCE_ALLOY, RESOURCE_CONDENSATE],
    [1]: [RESOURCE_COMPOSITE, RESOURCE_TUBE, RESOURCE_PHLEGM, RESOURCE_SWITCH, RESOURCE_CONCENTRATE],
    [2]: [RESOURCE_CRYSTAL, RESOURCE_FIXTURES, RESOURCE_TISSUE, RESOURCE_TRANSISTOR, RESOURCE_EXTRACT],
    [3]: [RESOURCE_LIQUID, RESOURCE_FRAME, RESOURCE_MUSCLE, RESOURCE_MICROCHIP, RESOURCE_SPIRIT],
    [4]: [RESOURCE_HYDRAULICS, RESOURCE_ORGANOID, RESOURCE_CIRCUIT, RESOURCE_EMANATION],
    [5]: [RESOURCE_MACHINE, RESOURCE_ORGANISM, RESOURCE_DEVICE, RESOURCE_ESSENCE]
}

export const roomLevel: {
    [roomName: string]: number
} = {
    'E49N19': 1,
    'E44N19': 2,
    'E47N22': 3,
    'E51N21': 4,
    'E49N22': 5,
};

// 产各种等级商品的房间
export const level2Room: {
    [level: number]: string
} = {
    1: 'E49N19',
    2: 'E44N19',
    3: 'E47N22',
    4: 'E51N21',
    5: 'E49N22',
};

export const targetStock: { [type: string]: number } = {
    [RESOURCE_COMPOSITE]: 400,
    [RESOURCE_CRYSTAL]: 220,
    [RESOURCE_LIQUID]: 300
}

// 存量，你想卖哪个就把哪个填的很大
export const commoditiesStock: {
    [level: number]: number
} = {
    [1]: 100,
    [2]: 20,
    [3]: 8,
    [4]: 4,
    [5]: 100,
}

@profile
export class Industry {

    static roomStock: { [roomName: string]: { [resource: string]: number } } = {};

    static run() {
        if (!Memory.industry) Memory.industry = {};
        let rooms: Room[] = [];
        for (const roomName in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomName)) {
                const room = Game.rooms[roomName];
                if (room.controller && room.controller.my) rooms.push(room);
            }
        }
        this.roomStock = {};
        this.getAllStock(rooms);

        for (const room of rooms) {
            if (!room.factory) continue;
            if (Game.time % 10 == 0) this.correctComponents(room.name);
            const factory = room.factory;
            if (Memory.industry[room.name]) {
                const state = Memory.industry[room.name];
                if (state.preparing) {
                    if (Industry.canProduce(state.type, state.amount, room.name)) {
                        console.log('Industry: room', room.name, 'produce', state.type, 'prepared, producing');
                        state.preparing = false;
                        state.producing = true;
                    } else if (!this.hasEnoughComponent(state.type, state.amount, room.name)) {
                        console.log(`Industry: ${room.name} producing ${state.type} amount ${state.amount} has missing some component. canceled`);
                        Memory.industry[room.name] = undefined as any;
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
            } else {
                if (Game.time % 2 == 0) continue;
                if (room.name in roomLevel) {
                    const level = roomLevel[room.name];
                    if (_.some(level2Commodities[level], product => {
                        if (this.getStock(product, room.name) >= this.getTargetStock(product)) return false;
                        return this.produce(product, this.getOnceAmount(product), room.name)
                    })) continue;
                }
                if (_.some(level2Commodities[0], product => this.produce(product, 200, room.name))) continue;

                // if(!Memory.industry[room.name]) {
                //     if(factory.store.battery >= 50 && !factory.cooldown) factory.produce(RESOURCE_ENERGY as any);
                // }
            }
        }
    }

    static produce(product: CommodityConstant, amount: number, roomName: string): boolean {
        let room = Game.rooms[roomName];
        if (!room) return false;
        let factory = room.factory;
        if (!factory) return false;

        if (this.hasEnoughComponent(product, amount, roomName)) {
            Industry.setState(product, amount, roomName);
            return true;
        } else {
            this.collectComponents(product, amount, roomName);
        }

        for (const component in COMMODITIES[product].components) {
            if (COMMODITIES[product].components.hasOwnProperty(component)) {
                const num = COMMODITIES[product].components[component] / COMMODITIES[product].amount * amount - this.getStock(component as any, roomName);
                if (num <= 0) continue;
                // if(roomName == 'E49N19') console.log('hello', roomName, component, product)
                if (commoditiesRawList.includes(component as any)) continue;
                if (Industry.isMatchLevel(component as any, roomName)) {
                    // let stock = Industry.getStock(component as any, roomName);
                    // if(stock < num){
                    let result = Industry.produce(component as any, Industry.toWholeNumber(component as any, num), roomName);
                    if (result == true) return true;
                    // Industry.setState(component as any, Industry.toWholeNumber(component as any, num), roomName, true);
                    // }
                }
            }
        }
        return false;
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
    }

    static collectComponents(product: CommodityConstant, amount: number, roomName: string) {
        for (const component in COMMODITIES[product].components) {
            if (!COMMODITIES[product].components.hasOwnProperty(component)) continue;
            let num = COMMODITIES[product].components[component] / COMMODITIES[product].amount * amount - this.getStock(component as any, roomName);
            if (num <= 0) continue;
            if (commoditiesRawList.includes(component as any) || barList.includes(component as any)) continue;
            if ('level' in COMMODITIES[component]) {
                const level = (COMMODITIES[component] as any).level;
                const sourceRoom = level2Room[level];
                const stock = this.getStock(component as any, sourceRoom);
                if (stock >= num) {
                    this.setTransport(component as any, num, sourceRoom, roomName);
                }
                continue;
            }
            for (const sourceRoom in this.roomStock) {
                if (sourceRoom == roomName) continue;
                const stock = this.roomStock[sourceRoom];
                if (component in stock && stock[component] > 0) {
                    let amount = Math.min(num, stock[component]);
                    if (this.isNeeded(component as any, sourceRoom)) {
                        const neededAmount = this.neededAmount(component as any, sourceRoom);
                        amount = Math.min(num, stock[component] - neededAmount);
                        if (amount <= 0) continue;
                    }
                    this.setTransport(component as any, amount, sourceRoom, roomName);
                    num -= stock[component];
                    if (num <= 0) break;
                }
            }
        }
    }

    static correctComponents(roomName: string) {
        const level = roomLevel[roomName];
        if (!level) return;
        const products = level2Commodities[level];
        for (const product of products) {
            _.forEach(this.roomStock, (stock, sourceRoom) => {
                if (stock[product] && roomLevel[sourceRoom!] != level && !this.isNeeded(product, sourceRoom!)) {
                    this.setTransport(product, stock[product], sourceRoom!, roomName);
                }
            })
        }
    }

    static getAllStock(rooms: Room[]) {
        for (const room of rooms) {
            let stock = {};
            if (room.terminal) stock = addObject(stock, room.terminal.store);
            if (room.storage) stock = addObject(stock, room.storage.store);
            this.roomStock[room.name] = stock;
        }
    }

    static getOnceAmount(type: CommodityConstant): number {
        if (!('level' in COMMODITIES[type])) return 0;
        const cooldown = COMMODITIES[type].cooldown;
        return this.toWholeNumber(type, 1000 / cooldown * COMMODITIES[type].amount);
    }

    static getTargetStock(type: CommodityConstant): number {
        if (type in targetStock) return targetStock[type];
        if ('level' in COMMODITIES[type]) return commoditiesStock[(COMMODITIES[type] as any).level];
        return 0;
    }

    static isMatchLevel(product: CommodityConstant, roomName: string): boolean {
        let level = (COMMODITIES[product] as any).level;
        if (!level) return true;
        return roomName == level2Room[level];
    }

    static isEqualLevel(product: CommodityConstant, roomName: string): boolean {
        let level = (COMMODITIES[product] as any).level;
        if (!level) return false;
        return roomName == level2Room[level];
    }

    static cacheNeededAmount = {};
    static neededAmount(type: CommodityConstant, roomName: string): number {
        if (this.cacheNeededAmount[type + roomName]) return this.cacheNeededAmount[type + roomName];
        const level = roomLevel[roomName] || 0;
        if (barList.includes(type as any)) return Infinity;
        if (level == 0 || commoditiesRawList.includes(type as any)) return 0;
        const needed = _.max(_.flatten(_.map(level2Commodities[level], product => _.map(COMMODITIES[product].components, (amount, component) => {
            if (component != type) return 0;
            amount = this.getOnceAmount(product);
            const num = COMMODITIES[product].components[component!] / COMMODITIES[product].amount * amount;
            return num;
        }))));
        return this.cacheNeededAmount[type + roomName] = needed;
    }

    static cacheIsNeeded = {};
    static isNeeded(type: CommodityConstant, roomName: string): boolean {
        if (this.cacheIsNeeded[type + roomName]) return this.cacheIsNeeded[type + roomName];
        const level = roomLevel[roomName] || 0;
        if (barList.includes(type as any)) return this.cacheIsNeeded[type + roomName] = true;
        if (level == 0 || commoditiesRawList.includes(type as any)) return this.cacheIsNeeded[type + roomName] = false;
        return this.cacheIsNeeded[type + roomName] = _.some(level2Commodities[level], product => _.some(COMMODITIES[product].components, (num, component) => component == type));
    }

    static canProduce(product: CommodityConstant, amount: number, roomName: string): boolean {
        let room = Game.rooms[roomName];
        if (!room) return false;
        let factory = room.factory;
        if (!factory) return false;
        for (const component in COMMODITIES[product].components) {
            if (COMMODITIES[product].components.hasOwnProperty(component)) {
                const num = COMMODITIES[product].components[component];
                if ((factory.store[component] || 0) < (num / COMMODITIES[product].amount) * amount) return false;
            }
        }
        // console.log(product, amount, roomName, canProduce);
        return true;
    }

    static hasEnoughComponent(product: CommodityConstant, amount: number, roomName: string): boolean {
        let room = Game.rooms[roomName];
        if (!room) return false;
        for (const component in COMMODITIES[product].components) {
            if (COMMODITIES[product].components.hasOwnProperty(component)) {
                const num = COMMODITIES[product].components[component];
                const store = this.getStock(component as any, roomName);
                if (store < (num / COMMODITIES[product].amount) * amount) return false;
            }
        }
        return true;
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
        store += _.sum(room.find(FIND_MY_POWER_CREEPS), pc => pc.store[resource] || 0);
        return store;
    }

    static calIndustryProfit(log: boolean = false) {
        let output: string[] = [];
        const result = {};
        for (const resourceType in COMMODITIES) {
            if (commoditiesRawList.includes(resourceType as any)) continue;
            const price = Market.getMarketPrice(resourceType as CommodityConstant);
            const cost = _.sum(this.getAllRaw(resourceType as CommodityConstant, 1, 0), (num, raw) => Market.getMarketPrice(raw as ResourceConstant) * num);
            const profitRate = ((price - cost) / cost) * 100;
            result[resourceType] = { resourceType, cost, price, profitRate };
            if (log) output.push([`type: ${resourceType}`, `cost: ${cost.toFixed(3)}`, `price: ${price.toFixed(3)}`, `rate: ${profitRate.toFixed(1)}%`].join('\t'));
        }
        if (log) console.log(output.join('\n'));
        return result;
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
