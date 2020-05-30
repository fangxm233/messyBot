import { profile } from "../profiler/decorator";
import { USER_NAME } from "../config";

export const commodities = [
    RESOURCE_UTRIUM_BAR,
    RESOURCE_LEMERGIUM_BAR,
    RESOURCE_ZYNTHIUM_BAR,
    RESOURCE_KEANIUM_BAR,
    RESOURCE_GHODIUM_MELT,
    RESOURCE_OXIDANT,
    RESOURCE_REDUCTANT,
    RESOURCE_PURIFIER,
    RESOURCE_BATTERY,
    RESOURCE_COMPOSITE,
    RESOURCE_CRYSTAL,
    RESOURCE_LIQUID,
    RESOURCE_WIRE,
    RESOURCE_SWITCH,
    RESOURCE_TRANSISTOR,
    RESOURCE_MICROCHIP,
    RESOURCE_CIRCUIT,
    RESOURCE_DEVICE,
    RESOURCE_CELL,
    RESOURCE_PHLEGM,
    RESOURCE_TISSUE,
    RESOURCE_MUSCLE,
    RESOURCE_ORGANOID,
    RESOURCE_ORGANISM,
    RESOURCE_ALLOY,
    RESOURCE_TUBE,
    RESOURCE_FIXTURES,
    RESOURCE_FRAME,
    RESOURCE_HYDRAULICS,
    RESOURCE_MACHINE,
    RESOURCE_CONDENSATE,
    RESOURCE_CONCENTRATE,
    RESOURCE_EXTRACT,
    RESOURCE_SPIRIT,
    RESOURCE_EMANATION,
    RESOURCE_ESSENCE,
];

export const maxMarketPrices: { [resourceType: string]: number } = {
	[RESOURCE_HYDROGEN] : 0.05 * 1000,
	[RESOURCE_OXYGEN]   : 0.05 * 1000,
	[RESOURCE_UTRIUM]   : 0.05 * 1000,
	[RESOURCE_LEMERGIUM]: 0.12 * 1000,
	[RESOURCE_KEANIUM]  : 0.05 * 1000,
	[RESOURCE_ZYNTHIUM] : 0.055 * 1000,
	[RESOURCE_CATALYST] : 0.125 * 1000,
    [RESOURCE_ENERGY]   : 0.025 * 1000,
    [RESOURCE_POWER]    : 0.5 * 1000,
    [RESOURCE_CATALYZED_GHODIUM_ACID]: 5 * 1000,
    [RESOURCE_SILICON]  : 6 * 1000,
    [RESOURCE_MIST]     : 4 * 1000,
};
export const minMarketPrices: { [resourceType: string]: number } = {
	[RESOURCE_HYDROGEN]     : 0.02 * 1000,
	[RESOURCE_OXYGEN]       : 0.02 * 1000,
	[RESOURCE_UTRIUM]       : 0.06 * 1000,
	[RESOURCE_LEMERGIUM]    : 0.11 * 1000,
	[RESOURCE_KEANIUM]      : 0.03 * 1000,
	[RESOURCE_ZYNTHIUM]     : 0.03 * 1000,
	[RESOURCE_CATALYST]     : 0.11 * 1000,
    [RESOURCE_ENERGY]       : 0.002 * 1000,
    [RESOURCE_POWER]        : 0.3 * 1000,
    [RESOURCE_OXIDANT]      : 0.22 * 1000,
    [RESOURCE_REDUCTANT]    : 0.25 * 1000,
    [RESOURCE_ZYNTHIUM_BAR] : 0.3 * 1000,
    [RESOURCE_LEMERGIUM_BAR]: 0.53 * 1000,
    [RESOURCE_UTRIUM_BAR]   : 0.31 * 1000,
    [RESOURCE_KEANIUM_BAR]  : 0.25 * 1000,
    [RESOURCE_PURIFIER]     : 0.95 * 1000,
    [RESOURCE_EMANATION]    : 14000 * 1000,
    [RESOURCE_ESSENCE]      : 100000 * 1000,
    [RESOURCE_ORGANISM]     : 160000 * 1000,
    [RESOURCE_MACHINE]      : 190000 * 1000,
    [RESOURCE_DEVICE]       : 170000 * 1000,
};

const neededType: ResourceConstant[] = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_ENERGY, RESOURCE_CATALYZED_GHODIUM_ACID];
if(Game.shard.name == 'shard3' && USER_NAME == 'fangxm') neededType.push(...[RESOURCE_SILICON, RESOURCE_MIST]);

let _sellType: ResourceConstant[] = [];
if(Game.shard.name == 'shard3') {
    _sellType = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_ENERGY, RESOURCE_POWER,
        RESOURCE_ESSENCE, RESOURCE_ORGANISM, RESOURCE_MACHINE, RESOURCE_DEVICE];
}
// if(USER_NAME == 'fangxm' && Game.shard.name == 'shard3') {
//     _sellType = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_ENERGY, RESOURCE_POWER,
//         RESOURCE_ESSENCE];
// }
if(Game.shard.name == 'shard2') {
    _sellType = [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_ENERGY, RESOURCE_POWER];
}

const sellType: ResourceConstant[] = _sellType;
    // [RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST, RESOURCE_ENERGY, RESOURCE_POWER,
    // /*RESOURCE_OXIDANT, RESOURCE_REDUCTANT, RESOURCE_ZYNTHIUM_BAR, RESOURCE_LEMERGIUM_BAR, RESOURCE_UTRIUM_BAR, RESOURCE_KEANIUM_BAR,*/ RESOURCE_ESSENCE];

const balanceTypes: ResourceConstant[] = [RESOURCE_ENERGY, RESOURCE_POWER, RESOURCE_OPS, RESOURCE_MIST, RESOURCE_SILICON, RESOURCE_BIOMASS, RESOURCE_METAL,
    RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_UTRIUM, RESOURCE_LEMERGIUM, RESOURCE_KEANIUM, RESOURCE_ZYNTHIUM, RESOURCE_CATALYST];

const history = Game.market.getHistory(RESOURCE_ENERGY);
const energyPrice = history[history.length - 2] ? history[history.length - 2].avgPrice * 1000 : 0.02 * 1000;

const config = {
    minMineralAmount: 10000,
    maxMineralAmount: 10000,
    startTradeEnergy: 700000,
    startTradeCredit: 5000,
}

@profile
export class Market{
    static roomsToDeal: string[];
    static dt: number;
    static run(){
        // let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: "token" });
        // let morder = _.min(orders, order => order.price);
        // if(morder.price <= Game.market.credits + 10000) Game.market.deal(morder.id, 1);

        this.roomsToDeal = [];
        for (const roomName in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomName)) {
                const room = Game.rooms[roomName];
                if(!room.terminal || !room.terminal.my) continue;
                // this.clearOrders(roomName);
                this.checkOrders(roomName);
                if(!this.hasOrder(roomName)) this.roomsToDeal.push(roomName);
            }
        }
        if(!this.roomsToDeal.length) return;

        if(Memory.poorRoom){
            for (const roomName of this.roomsToDeal) {
                let market = Memory.market[roomName];
                let storage = Game.rooms[roomName].storage;
                if(!storage) continue;
                if(storage.store.energy > 700000 && !market.transport)
                    market.transport = { type: RESOURCE_ENERGY, amount: 20000, des: Memory.poorRoom};
            }
        }
        // let o = this.getAllOrders({resourceType: RESOURCE_ENERGY, type: ORDER_BUY});
        // let mp = _.max(o, oo => oo.id == '5e2d294f4ea8058706ba5bdb' ? -Infinity : oo.price);
        // let order1 = Game.market.getOrderById('5e2d294f4ea8058706ba5bdb');
        // // let order2 = Game.market.getOrderById('5e2d29d44ea8056fe3ba8b42');
        // if(order1 && order1.price < mp.price * 0.001 && mp.price * 0.001 <= 0.05) {
        //     Game.market.changeOrderPrice('5e2d294f4ea8058706ba5bdb', mp.price * 0.001)
        // }
        // if(order2 && order2.price < mp.price * 0.001 && mp.price * 0.001 <= 0.05) {
        //     Game.market.changeOrderPrice('5e2d29d44ea8056fe3ba8b42', mp.price * 0.001)
        // }

        if(Game.time % 20 == 0) this.postOrders();

        _.remove(this.roomsToDeal, this.hasOrder);
        if(!this.roomsToDeal.length) return;

        if(Game.time % 2 == 0) this.balanceResources();
        _.remove(this.roomsToDeal, this.hasOrder);
        if(!this.roomsToDeal.length) return;
        
        this.handleExcess(Memory.poorRoom ? false : true);
        _.remove(this.roomsToDeal, this.hasOrder);
        if(!this.roomsToDeal.length) return;
        
        if(Game.market.credits < config.startTradeCredit) return;

        this.handleLess();
        _.remove(this.roomsToDeal, this.hasOrder);
        if(!this.roomsToDeal.length) return;

        // this.roomsToDeal = this.getStoredGreaterEqualThan(this.roomsToDeal, RESOURCE_ENERGY, config.startTradeEnergy, 'storage');
        // _.remove(this.roomsToDeal, roomName => Memory.poorRoom == roomName);
        // if(!this.roomsToDeal.length) return;

        // this.lookForGoodDeal();
    }

    static balanceResources(){
        for (const resourceType of balanceTypes) {
            let mostAmount = 0;
            let leastAmount = Number.MAX_VALUE;
            let mostRoom: Room | undefined = undefined;
            let leastRoom: Room | undefined = undefined;

            for (const roomName of this.roomsToDeal) {
                let room = Game.rooms[roomName];
                let terminal = room.terminal;
                let storage = room.storage;
                if(!terminal || !storage) continue;
                if(terminal.store.getFreeCapacity() == 0) continue;
                if(resourceType == RESOURCE_ENERGY || resourceType == RESOURCE_OPS){
                    if(storage.store.getUsedCapacity(resourceType) + terminal.store.getUsedCapacity(resourceType) > mostAmount){
                        mostAmount = storage.store.getUsedCapacity(resourceType) + terminal.store.getUsedCapacity(resourceType);
                        mostRoom = room;
                    }
                    if(storage.store.getUsedCapacity(resourceType) + terminal.store.getUsedCapacity(resourceType) < leastAmount){
                        leastAmount = storage.store.getUsedCapacity(resourceType) + terminal.store.getUsedCapacity(resourceType);
                        leastRoom = room;
                    }
                }else{
                    let store = terminal.store.getUsedCapacity(resourceType);
                    if(store > mostAmount){
                        mostAmount = store;
                        mostRoom = room;
                    }
                    if(store < leastAmount){
                        leastAmount = store;
                        leastRoom = room;
                    }
                }
            }

            if(mostRoom && leastRoom && mostRoom.name != leastRoom.name && mostAmount - leastAmount > (resourceType == RESOURCE_ENERGY ? 50000 : 10000)){
                Memory.market[mostRoom.name].transport = { type: resourceType, amount: resourceType == RESOURCE_ENERGY ? 20000 : 10000, des: leastRoom.name };
                console.log('balance resource', resourceType, 'from', mostRoom.name, 'to', leastRoom.name, 'amount:', resourceType == RESOURCE_ENERGY ? 20000 : 10000);
            }

            _.remove(this.roomsToDeal, this.hasOrder);
        }
    }

    static handleExcess(sellEnergy: boolean){
        for (const materialType of sellType) {
            if(!this.roomsToDeal.length) return;
            let stored = this.getStored(this.roomsToDeal, materialType);
            if(!stored.length) continue;
            if(materialType == RESOURCE_ENERGY && !sellEnergy) continue;
            if(materialType == RESOURCE_ESSENCE || materialType == RESOURCE_ORGANISM || materialType == RESOURCE_MACHINE || materialType == RESOURCE_DEVICE){
                let storedMoreThan = this.getStoredGreaterEqualThan(stored, materialType, 2, 'terminal');
                if(!storedMoreThan.length) continue;
                let orders = this.getAllOrders({resourceType: materialType, type: ORDER_BUY});
                orders = orders.filter(order => order.amount >= 1 && order.price >= minMarketPrices[order.resourceType] && !this.isStarted(order))
                if(!orders.length) continue;
                for (const roomName of storedMoreThan) {
                    let terminal = Game.rooms[roomName].terminal;
                    if(!terminal) continue;
                    let sourceAmount = terminal.store.getUsedCapacity(materialType);
                    let sellAmount = sourceAmount;
                    let order = _.max(orders, (order) => this.isStarted(order) ? -1 : this.getProfit(roomName, order, Math.min(10000, sellAmount), energyPrice));
                    if(this.getProfit(roomName, order, Math.min(sellAmount, order.amount), energyPrice) > 0 && !this.isStarted(order)){
                        this.startOrder(Game.rooms[roomName], order, Math.min(sellAmount, order.amount));
                    }
                }
                _.remove(this.roomsToDeal, this.hasOrder);
                continue;
            }
            if(materialType == RESOURCE_ENERGY){
                let storedMoreThan = this.getStoredGreaterEqualThan(stored, RESOURCE_ENERGY, 780000, 'storage');
                if(!storedMoreThan.length) continue;
                let orders = this.getAllOrders({resourceType: RESOURCE_ENERGY, type: ORDER_BUY});
                orders = orders.filter(order => order.amount >= 10000 && order.price >= minMarketPrices[order.resourceType] && !this.isStarted(order))
                if(!orders.length) continue;
                for (const roomName of storedMoreThan) {
                    let order = _.max(orders, (order) => this.isStarted(order) ? -1 : this.getProfit(roomName, order, 10000, energyPrice));
                    if(this.getProfit(roomName, order, 10000, energyPrice) > 0 && !this.isStarted(order)){
                        this.startOrder(Game.rooms[roomName], order, 10000);
                    }
                }
                _.remove(this.roomsToDeal, this.hasOrder);
            }else{
                let storedMoreThan = this.getStoredGreaterEqualThan(
                    stored, materialType, this.isCommodities(materialType) ? 10000 : config.maxMineralAmount + 10000, 'terminal');
                if(!storedMoreThan.length) continue;
                let orders = this.getAllOrders({resourceType: materialType, type: ORDER_BUY});
                orders = orders.filter(order => order.amount >= 1000 && order.price >= minMarketPrices[order.resourceType] && !this.isStarted(order))
                if(!orders.length) continue;
                for (const roomName of storedMoreThan) {
                    let terminal = Game.rooms[roomName].terminal;
                    if(!terminal) continue;
                    let sourceAmount = terminal.store.getUsedCapacity(materialType);
                    let sellAmount = sourceAmount - (this.isCommodities(materialType) ? 5000 : config.maxMineralAmount);
                    let order = _.max(orders, (order) => this.isStarted(order) ? -1 : this.getProfit(roomName, order, Math.min(10000, sellAmount), energyPrice));
                    if(this.getProfit(roomName, order, Math.min(sellAmount, order.amount), energyPrice) > 0 && !this.isStarted(order)){
                        this.startOrder(Game.rooms[roomName], order, Math.min(sellAmount, order.amount));
                    }
                }
                _.remove(this.roomsToDeal, this.hasOrder);
            }
        }
    }

    static handleLess(){
        for (const materialType of neededType) {
            if(materialType == RESOURCE_ENERGY) continue;
            if(!this.roomsToDeal.length) return;
            let storedLessThan = this.getStoredLessThan(this.roomsToDeal, materialType, config.minMineralAmount, 'terminal');
            if(!storedLessThan.length) continue;
            let orders = this.getAllOrders({resourceType: materialType, type: ORDER_SELL});
            orders = orders.filter(order => order.amount >= 100 && order.price <= maxMarketPrices[order.resourceType] && !this.isStarted(order))
            if(!orders.length) continue;
            for (const roomName of storedLessThan) {
                let terminal = Game.rooms[roomName].terminal;
                if(!terminal) continue;
                let sourceAmount = terminal.store.getUsedCapacity(materialType);
                let buyAmount = config.minMineralAmount - sourceAmount;
                let order = _.min(orders, (order) => this.isStarted(order) ? Infinity : this.getCost(roomName, order, Math.min(10000, buyAmount), energyPrice));
                if(!this.isStarted(order)) this.startOrder(Game.rooms[roomName], order, Math.min(buyAmount, orders[0].amount));
            }
            _.remove(this.roomsToDeal, this.hasOrder);
        }
    }

    static lookForGoodDeal(){
        this.dt = 0;
        console.log(this.roomsToDeal.length)
        for (const materialType of neededType) {
            if(!this.roomsToDeal.length) return;
            let t1 = Game.cpu.getUsed();
            let sellOrders = this.getAllOrders({resourceType: materialType, type: ORDER_SELL});
            sellOrders = sellOrders.filter(order => order.amount >= 1000 && !this.isStarted(order));
            let buyOrders = Game.market.getAllOrders({resourceType: materialType, type: ORDER_BUY});
            buyOrders = buyOrders.filter(order => order.amount >= 1000 && !this.isStarted(order));
            // this.dt += Game.cpu.getUsed() - t1;
            if(!sellOrders.length || !buyOrders.length) continue;
            if(this.isEqualToCache2(sellOrders) && this.isEqualToCache2(buyOrders)) continue;
            this.cacheOrders(sellOrders);
            this.cacheOrders(buyOrders);
            for (const roomName of this.roomsToDeal) {
                let terminal = Game.rooms[roomName].terminal;
                if(!terminal) continue;
                let store = terminal.store.getUsedCapacity(materialType);
                if(store < 1000) continue;
                let sellOrder = _.min(sellOrders, order => this.isStarted(order) ? Infinity : this.getCost(roomName, order, 10000, energyPrice));
                let buyOrder = _.max(buyOrders, order => this.isStarted(order) ? -Infinity : this.getProfit(roomName, order, 10000, energyPrice));
                if(this.isStarted(sellOrder) || this.isStarted(buyOrder)) break;

                let amount = Math.min(sellOrder.amount, buyOrder.amount);
                amount = Math.min(store, amount);
                amount = 1000 * Math.floor(amount / 1000);

                let profit = this.getProfit(roomName, buyOrder, amount, energyPrice) - this.getCost(roomName, sellOrder, amount, energyPrice);
                if(profit < 100) continue;

                this.startOrder(Game.rooms[roomName], sellOrder, amount);
                this.startOrder(Game.rooms[roomName], buyOrder, amount);
            }
            _.remove(this.roomsToDeal, this.hasOrder);
        }
    }

    static postOrders() {
        let resources = ['XGH2O'];
        let rooms = _.filter(Game.rooms, room => room.controller && room.controller.my && room.terminal && room.terminal.my);
        resources.forEach(resource => {
            rooms.forEach(room => {
                let terminal = room.terminal;
                if(!terminal) return;
                let store = terminal.store[resource];
                if(store >= 9000) return;
                let order = _.filter(Game.market.orders, order => order.resourceType == resource && order.roomName == room.name && order.type == ORDER_BUY)[0];
                if(!order) {
                    Game.market.createOrder({type: ORDER_BUY, resourceType: resource as any, roomName: room.name, price: 5, totalAmount: Math.max(2000, 10000 - store)});
                    return;
                } else {
                    if(order.price < 5) Game.market.changeOrderPrice(order.id, 5)
                    if(order.remainingAmount < 1000) Game.market.extendOrder(order.id, 1000);
                }
            })
        })
    }

    static getAllOrders(filter?: OrderFilter | ((o: Order) => boolean)): Order[]{
        let originalP = JSON.parse;
        let originalS = JSON.stringify;
        changeParse();
        changeStringify();
        let result = Game.market.getAllOrders(filter);
        JSON.parse = originalP;
        JSON.stringify = originalS;
        return result;
        function changeParse(){
            let original = JSON.parse;
            function changedParse(s){
                return s;
            }
            JSON.parse = changedParse;
        }
        function changeStringify(){
            let original = JSON.stringify;
            function changedStringify(s){
                for (const orderId in s) {
                    const order = s[orderId];
                    order.price *= 1000;
                }
                return s;
            }
            JSON.stringify = changedStringify;
        }
    }

    static checkOrders(roomName: string){
        let market = Memory.market[roomName];
        if(!market.orderFinished){
            market.orderFinished = {} as any;
            market.orderFinished.buy = {} as any;
            market.orderFinished.sell = {} as any;
        }

        if(Game.time - market.orderFinished.buy.time == 1){
            let buy = market.orderFinished.buy;
            let transaction = this.getMyOutgoingTransaction(0);
            if(!transaction || transaction.order && transaction.order.id != buy.order.id){
                console.log(roomName, 'buy order didn\'t finish: order has been finished by others');
                if(market.sellOrder)  this.cancelOrder(market, 'sell', 'above reason', roomName);
            }else if(transaction.amount < buy.amount){
                market.sellAmount = transaction.amount;
                console.log(roomName, 'sell order amount reduced: buy order amount didn\'t reach expect');
            }
        } else market.orderFinished.buy = {} as any;

        if(Game.time - market.orderFinished.sell.time == 1){
            let sell = market.orderFinished.sell;
            let transaction = this.getMyIncommingTransaction(0);
            if(!transaction || transaction.order && transaction.order.id != sell.order.id){
                console.log(roomName, 'sell order didn\'t finish: order has been finished by others');
            }else if(transaction.amount < sell.amount){
                console.log(roomName, 'sell order amount didn\'t reach expect');
            }
        } else market.orderFinished.sell = {} as any;

        if(market.buyOrder){
            let order = Game.market.getOrderById(market.buyOrder);
            if(!order){
                this.cancelOrder(market, 'buy', 'order doesn\'t exist', roomName);
                this.cancelOrder(market, 'sell', 'buy order canceled', roomName);
            }else{
                if(order.amount < market.buyAmount){
                    this.cancelOrder(market, 'buy', 'order amount too few', roomName);
                    this.cancelOrder(market, 'sell', 'buy order canceled', roomName);
                }
                else if(order.price < market.buyPrice){
                    this.cancelOrder(market, 'buy', 'order price decline', roomName);
                    this.cancelOrder(market, 'sell', 'buy order canceled', roomName);
                }
            }
        }
        if(market.sellOrder){
            let order = Game.market.getOrderById(market.sellOrder);
            if(!order){
                this.cancelOrder(market, 'sell', 'order doesn\'t exist', roomName);
                return;
            }else{    
                if(order.amount < market.sellAmount){
                    this.cancelOrder(market, 'sell', 'order amount too few', roomName);
                    return;
                }
                else if(order.price > market.sellPrice){
                    this.cancelOrder(market, 'sell', 'order price rise', roomName);
                    return;
                }
            }
        }
    }

    static changePrices() {
        for (const resourceType in maxMarketPrices) {
            if (maxMarketPrices.hasOwnProperty(resourceType)) {
                if(resourceType == RESOURCE_SILICON || resourceType == RESOURCE_MIST) continue;
                let histories = Game.market.getHistory(resourceType as any);
                let history = histories[histories.length - 1];
                if(history) {
                    maxMarketPrices[resourceType] = history.avgPrice + history.stddevPrice;
                    maxMarketPrices[resourceType] *= 1000;
                }
            }
        }
        for (const resourceType in minMarketPrices) {
            if (minMarketPrices.hasOwnProperty(resourceType)) {
                if(resourceType == RESOURCE_ESSENCE) continue;
                if(resourceType == RESOURCE_ORGANISM) continue;
                if(resourceType == RESOURCE_DEVICE) continue;
                if(resourceType == RESOURCE_MACHINE) continue;
                let histories = Game.market.getHistory(resourceType as any);
                let history = histories[histories.length - 1];
                if(history) {
                    minMarketPrices[resourceType] = history.avgPrice - history.stddevPrice;
                    minMarketPrices[resourceType] *= 1000;
                }
            }
        }
    }

    static getMarketPrice(type: ResourceConstant): number{
        if(type == 'mist' || type == 'biomass' || type == 'metal' || type == 'silicon') return 2.5;
        let histories = Game.market.getHistory(type);
        let history = histories[histories.length - 2];
        if(history) return history.avgPrice;
        return 0;
    }

    static getStored(rooms: string[], type: string): string[]{
        let resoult: string[] = [];
        for (const roomName of rooms) {
            let terminal = Game.rooms[roomName].terminal;
            if(!terminal) continue;
            if(terminal.store[type]) resoult.push(roomName);
        }
        return resoult;
    }

    static getStoredGreaterEqualThan(rooms: string[], type: ResourceConstant, amount: number, containerType: 'storage' | 'terminal'): string[]{
        let result: string[] = [];
        for (const roomName of rooms) {
            let container = containerType == 'storage' ? Game.rooms[roomName].storage : Game.rooms[roomName].terminal;
            if(!container) continue;
            if(container.store.getUsedCapacity(type) >= amount) result.push(roomName);
        }
        return result;
    }

    static getStoredLessThan(rooms: string[], type: ResourceConstant, amount: number, containerType: 'storage' | 'terminal'): string[]{
        let result: string[] = [];
        for (const roomName of rooms) {
            let container = containerType == 'storage' ? Game.rooms[roomName].storage : Game.rooms[roomName].terminal;
            if(!container) continue;
            if(container.store.getUsedCapacity(type) < amount) result.push(roomName);
        }
        return result;
    }

    static hasOrder(roomName: string): boolean{
        let market = Memory.market[roomName];
        if(market.buyOrder || market.sellOrder || market.transport){
            return true;
        }
        return false;
    }

    static clearOrders(roomName: string){
        let market = Memory.market[roomName];
        this.cancelOrder(market, 'buy', 'clear', roomName);
        this.cancelOrder(market, 'sell', 'clear', roomName);
    }

    static isNeeded(type: ResourceConstant): boolean{
        return _.contains(neededType, type);
    }

    static isCommodities(resource: string): boolean{
        return _.includes(commodities, resource);
    }

    static startOrder(room: Room, order: Order, amount: number){
        let market = Memory.market[room.name];
        if(order.type == ORDER_BUY){
            market.buyAmount = amount;
            market.buyOrder = order.id;
            market.buyPrice = order.price * 0.001;
        }else{
            market.sellAmount = amount;
            market.sellOrder = order.id;
            market.sellPrice = order.price * 0.001;
        }
        this.logOrder(room, order, amount);
    }

    static isStarted(order: Order): boolean{
        for (const roomName in Game.rooms) {
            if (Game.rooms.hasOwnProperty(roomName)) {
                const room = Game.rooms[roomName];
                if(!room.terminal || !room.terminal.my) continue;
                let market = Memory.market[roomName];
                if(market.buyOrder && market.buyOrder == order.id) return true;
                if(market.sellOrder && market.sellOrder == order.id) return true;
            }
        }
        return false;
    }

    static isEqualToCache(orders: Order[]): boolean{
        if(!global.cacheOrders) return false;
        if(!global.cacheOrders[orders[0].type][orders[0].resourceType]) return false;
        let buy = orders[0].type == 'buy';
        let cacheOrders: Order[] = global.cacheOrders[orders[0].type][orders[0].resourceType];
        if(cacheOrders.length < orders.length) return false;
        let old_i = 0, new_i = 0;
        while (true) {
            const oldOrder = cacheOrders[old_i];
            const newOrder = orders[new_i];
            if(!newOrder) return true;
            if(!oldOrder) return false;
            if(newOrder.id == oldOrder.id && newOrder.price <= oldOrder.price && buy ||
                newOrder.id == oldOrder.id && newOrder.price >= oldOrder.price && !buy){
                old_i++;
                new_i++;
                continue;
            }
            if(old_i == cacheOrders.length - 1 && new_i != orders.length - 1) return false;
            if(oldOrder.id != newOrder.id){
                old_i++;
                continue;
            }
        }
    }

    static isEqualToCache2(orders: Order[]): boolean{
        if(!global.cacheOrders) return false;
        if(!global.cacheOrders[orders[0].type][orders[0].resourceType]) return false;
        let buy = orders[0].type == 'buy';
        let cacheOrders: Order[] = global.cacheOrders[orders[0].type][orders[0].resourceType];
        if(cacheOrders.length != orders.length) return false;
        for (let i = 0; i < cacheOrders.length; i++) {
            const o_order = cacheOrders[i];
            const n_order = orders[i];
            if(o_order.id != n_order.id) return false;
            if(o_order.price != n_order.price) {
                if(n_order.price > o_order.price && buy ||
                    n_order.price < o_order.price && !buy){
                    return false;
                }
            }
            if(o_order.amount < n_order.amount){
                if(n_order.amount > 1000 && o_order.amount < 1000) return false;
            }
        }
        return true;
    }

    static cacheOrders(orders: Order[]){
        if(!orders.length) return;
        if(!global.cacheOrders){
            global.cacheOrders = {} as any;
            global.cacheOrders.buy = {};
            global.cacheOrders.sell = {};
        }
        global.cacheOrders[orders[0].type][orders[0].resourceType] = orders;
    }

    static logOrder(room: Room, order: Order, amount: number){
        console.log(`${room.name} Start order:\n${JSON.stringify(order, undefined, 4)}\namount: ${amount}\t${order.type == ORDER_BUY ?
             'profit: ' + this.getProfit(room.name, order, amount, energyPrice) : 'cost: ' + this.getCost(room.name, order, amount, energyPrice)}`);
    }

    static cancelOrder(market: marketConfig, type: 'buy' | 'sell', reason?: string, roomName?: string){
        if(type == 'buy'){
            market.buyAmount = 0;
            market.buyOrder = '';
            market.buyPrice = 0;
        }else{
            market.sellAmount = 0;
            market.sellOrder = '';
            market.sellPrice = 0;
        }
        console.log((roomName || '') + ' ' + type + ' order canceled: ' + (reason || ''));
    }

    static finishOrder(market: marketConfig, order: Order, roomName: string){
        if(order.type == ORDER_BUY){
            this.cancelOrder(market, 'buy', 'order finished', roomName);
            market.orderFinished.buy.order = order;
            market.orderFinished.buy.amount = market.buyAmount;
            market.orderFinished.buy.time = Game.time;
        }else{
            this.cancelOrder(market, 'sell', 'order finished', roomName);
            market.orderFinished.sell.order = order;
            market.orderFinished.sell.amount = market.sellAmount;
            market.orderFinished.sell.time = Game.time;
        }
    }

    static getMyOutgoingTransaction(index: number): Transaction | undefined{
        for (let i = 0; i < Game.market.outgoingTransactions.length; i++) {
            const order = Game.market.outgoingTransactions[i];
            if(!order.order) continue;
            if(order.sender && order.sender.username != USER_NAME) index++;
            if(i == index) return order;
        }
        return undefined;
    }

    static getMyIncommingTransaction(index: number): Transaction | undefined{
        for (let i = 0; i < Game.market.incomingTransactions.length; i++) {
            const order = Game.market.incomingTransactions[i];
            if(!order.order) continue;
            if(order.recipient && order.recipient.username != USER_NAME) index++;
            if(i == index) return order;
        }
        console.log('no');
        return undefined;
    }

    static getProfit(roomName: string, order: Order, amount: number, energyPrice: number){
        if(!order.roomName) return 0;
        if(amount == 0) amount = 1000000;
        let cost = Game.market.calcTransactionCost(amount, roomName, order.roomName);
        return (amount * order.price - cost * energyPrice) * 0.001;
    }

    static getCost(roomName: string, order: Order, amount: number, energyPrice: number){
        if(!order.roomName) return 0;
        if(amount == 0) amount = 1000000;
        let cost = Game.market.calcTransactionCost(amount, roomName, order.roomName);
        return (amount * order.price + cost * energyPrice) * 0.001;
    }
}