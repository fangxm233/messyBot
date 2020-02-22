import { Role } from "./role";
import { profile } from "../profiler/decorator";
import { Market } from "../extensions/market";
import { isStoreStructure } from "../declarations/typeGuards";
import { barIndustry } from "../programs/industry";
import { CreepWish } from "../programs/creepWish";
import { refreshGameObject, getTargetBodyPart } from "../utils";
import { Process } from "../process/process";
import { ProcessBoost } from "../process/instances/boost";
import { RoomPlanner } from "../roomPlanner/RoomPlanner";

const terminalEnergy = 50000;

@profile
export class RoleManager extends Role{
    store: Store<ResourceConstant, false>;
    room: Room;
    storage: StructureStorage | StructureContainer;
    terminal: StructureTerminal;
    memory: CreepMemory;

    fillingState: 'get' | 'fill';

    run_(){
        if(!this.creep.ticksToLive) return;
        let storage: StructureContainer | StructureStorage | null = Game.getObjectById(this.creep.room.memory.storage);
        if(!storage) return;
        if (this.creep.ticksToLive < 3) {
            this.transferAll(storage);
            return;
        }
        
        let room = this.creep.room;
        let roomName = room.name;
        let store = this.creep.store;
        let pos = this.creep.pos;
        if(!Memory.stableData[roomName]) return;
        let basePos = Memory.stableData[roomName].basePosition;
        if(!basePos) return;
        let centerPos = new RoomPosition(basePos.x + 5, basePos.y + 5, roomName);
        let terminal = room.terminal;

        let towers = _.filter(room.towers, tower => tower.energy < 600);
        if(towers.length){
            let remain = 1000 - towers[0].energy;
            // console.log(remain);
            if(store.getUsedCapacity() - store.energy > 0) this.transferAll(storage);
            if(store.energy < remain){
                this.getEnergy(storage, remain);
                if(!(this.creep.pos.getRangeTo(storage) > 1 && store.energy == 0)) this.transferEnergy(towers[0], remain);
                return;
            } else this.transferEnergy(towers[0], remain);
            return;
        }

        let linkId = room.memory.centerLink;
        let link = Game.getObjectById<StructureLink>(linkId);

        let nuker = room.nuker;
        if(nuker && (link && link.store.energy < 600 || !link)){
            // if(nuker.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
            //     let remain = nuker.store.getFreeCapacity(RESOURCE_ENERGY);
            //     if(store.energy == 0) this.getEnergy(storage, remain);
            //     if(store.energy) this.transferEnergy(nuker, remain);
            //     return;
            // }

            if(nuker.store.getUsedCapacity(RESOURCE_GHODIUM) < nuker.store.getCapacity(RESOURCE_GHODIUM) && terminal){
                if(terminal.store.G || store.G){
                    let remain = nuker.store.getCapacity(RESOURCE_GHODIUM) - nuker.store.getUsedCapacity(RESOURCE_GHODIUM);
                    if(!store.G) this.get(terminal, RESOURCE_GHODIUM, remain);
                    if(store.G) this.transfer(nuker, RESOURCE_GHODIUM, remain);
                    return;
                }
            }
        }

        // let factory = room.factory;
        // if(factory && terminal){
        //     let type = room.memory.mineral.type;
        //     let product = barIndustry[type];

        //     if(this.creep.store.getUsedCapacity(product)){
        //         this.transfer(terminal, product);
        //         return;
        //     }
        //     if(this.creep.store.getUsedCapacity(type)){
        //         this.transfer(factory, type);
        //         return;
        //     }

        //     if(factory.store.energy <= 9000){
        //         let remain = 10000;
        //         if(store.energy == 0) this.getEnergy(storage, remain);
        //         if(store.energy) this.transferEnergy(factory, remain);
        //         return;
        //     }

        //     let pstore = factory.store.getUsedCapacity(product);
        //     if(pstore >= this.creep.store.getCapacity()){
        //         if(!store[product]) this.get(factory, product);
        //         return;
        //     }

        //     let rfstore = factory.store.getUsedCapacity(type);
        //     let rtstore = terminal.store.getUsedCapacity(type);
        //     if(rtstore > 15000 && rfstore < 35000 && (link && link.store.energy < 600 || !link)){
        //         if(!store[type]) this.get(terminal, type);
        //         if(store[type]) this.transfer(factory, type);
        //         if(store.energy) this.transfer(factory, RESOURCE_ENERGY);
        //         return;
        //     }
        // }

        if(pos.x != centerPos.x || pos.y != centerPos.y){
            this.creep.travelTo(centerPos);
            return;
        }

        let market = Memory.market[roomName];
        if(store.getUsedCapacity(RESOURCE_OPS) && (!market || !market.transport || market.transport.type != RESOURCE_OPS)){
            this.transfer(storage, RESOURCE_OPS);
            return;
        }
        if(terminal && terminal.store.getUsedCapacity(RESOURCE_OPS) && (!market.transport || market.transport.type != RESOURCE_OPS)){
            this.get(terminal, RESOURCE_OPS);
            this.transfer(storage, RESOURCE_OPS);
            return;
        }

        let powerSpawn = room.powerSpawn;
        if(powerSpawn){
            if(storage.energy > 700000) powerSpawn.processPower();
        }

        let upLink = Game.getObjectById<StructureLink>(room.memory.upgradeLink);

        if(upLink && link && upLink.store.energy < 600){
            let remain = upLink.store.getCapacity(RESOURCE_ENERGY) - upLink.store.energy - link.store.energy;
            if(remain <= 0) { link.transferEnergy(upLink); return; }
            if(store.energy < remain) this.getEnergy(storage, remain);
            else this.transferEnergy(link, remain);
            return;
        }
        if(link && link.store.energy > 0){
            this.getEnergy(link);
            this.transferEnergy(room.storage);
            return;
        }

        if(powerSpawn){
            if(powerSpawn.store.energy < powerSpawn.store.getCapacity(RESOURCE_ENERGY) - 1000){
                let remain = powerSpawn.store.getCapacity(RESOURCE_ENERGY) - powerSpawn.store.energy;
                this.getEnergy(storage, remain);
                this.transferEnergy(powerSpawn, remain);
                return;
            }
            let terminal = room.terminal;
            if(terminal && powerSpawn.store.getUsedCapacity(RESOURCE_POWER) == 0 && (terminal.store.power || store.power)){
                let remain = powerSpawn.store.getCapacity(RESOURCE_POWER);
                this.get(terminal, RESOURCE_POWER, remain);
                this.transfer(powerSpawn, RESOURCE_POWER, remain);
                return;
            }
        }
        if (!terminal || !market) return;

        if(storage.store.getUsedCapacity() - storage.store.energy - storage.store.getUsedCapacity(RESOURCE_OPS) > 0){
            for (const key in storage.store) {
                if(key == RESOURCE_ENERGY || key == RESOURCE_OPS) continue;
                if (this.creep.withdraw(storage, key as ResourceConstant) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(storage);
                    return;
                }
            }
            this.transferAll(terminal);
            return;
        }
        if (market.buyOrder) {
            let order = Game.market.getOrderById(market.buyOrder);
            if (!order || order.amount == 0)
                Market.cancelOrder(market, 'buy', 'invalid order');
            else {
                if(order.resourceType == SUBSCRIPTION_TOKEN) return;
                let tstore = terminal.store.getUsedCapacity(order.resourceType);
                let sstore = storage.store.getUsedCapacity(order.resourceType);
                if(!order.roomName) return;
                if(tstore == undefined) tstore = 0;
                if(sstore == undefined) sstore = 0;
                if (tstore >= market.buyAmount) {
                    let need = Game.market.calcTransactionCost(market.buyAmount, order.roomName, roomName)
                        + (order.resourceType == RESOURCE_ENERGY ? market.buyAmount : 0);
                    if (need <= terminal.store.energy && terminal.cooldown == 0){
                            Game.market.deal(order.id, market.buyAmount, roomName);
                            Market.finishOrder(market, order, roomName);
                    }
                    else {
                        if(_.sum(store) - store.energy > 0){
                            this.transferAll(terminal);
                            return;
                        }
                        let remain = need - terminal.store.energy;
                        this.getEnergy(storage, remain);
                        this.transferEnergy(terminal, remain);
                    }
                } else {
                    if(store[order.resourceType] == 0)this.creep.withdraw(storage, order.resourceType as ResourceConstant);
                    if(store[order.resourceType] > 0) this.creep.transfer(terminal, order.resourceType as ResourceConstant);
                }
            }
            return;
        }
        else if (market.sellOrder) {
            let order = Game.market.getOrderById(market.sellOrder);
            if (!order || order.amount == 0)
                Market.cancelOrder(market, 'sell', 'invalid order');
            else {
                if(!order.roomName) return;
                if (Game.market.credits >= order.price * market.sellAmount) {
                    let need = Game.market.calcTransactionCost(market.sellAmount, order.roomName, roomName)
                        + (order.resourceType == RESOURCE_ENERGY ? market.sellAmount : 0);
                    if (need <= terminal.store.energy && terminal.cooldown == 0){
                            Game.market.deal(order.id, market.sellAmount, roomName);
                            Market.finishOrder(market, order, roomName);
                    }
                    else {
                        let remain = need - terminal.store.energy;
                        this.getEnergy(storage, remain);
                        this.transferEnergy(terminal, remain);
                    }
                }
            }
            return;
        }
        
        if (terminal.store.energy < terminalEnergy - 10000){
            let remain = terminalEnergy - terminal.store.energy;
            if(store.energy == 0) this.getEnergy(storage, remain);
            if(store.energy > 0) this.creep.transfer(terminal, RESOURCE_ENERGY);
            return;
        }

        let transport = market.transport;
        if(transport){
            let tstore = terminal.store.getUsedCapacity(transport.type);
            this.creep.withdraw(storage, transport.type);
            this.creep.transfer(terminal, transport.type);
            let fare = Game.market.calcTransactionCost(transport.amount, roomName, transport.des);
            if(tstore >= transport.amount + (transport.type == RESOURCE_ENERGY ? fare : 0)) {
                terminal.send(transport.type, transport.amount, transport.des);
                delete market.transport;
            }
            return;
        }

        if (terminal.store.energy > terminalEnergy + 10000){
            // console.log('helloin')
            let remain = terminal.store.energy - terminalEnergy;
            // console.log(remain)
            if(store.energy == 0) this.getEnergy(terminal, remain);
            if(store.energy > 0) {
                // this.creep = refreshGameObject(this.creep);
                // console.log('transfer');
                this.transfer(room.storage, RESOURCE_ENERGY);
                // console.log(storage, storage.store.getCapacity(), storage.store.energy);

            }
            return;
        }

        if(store.energy > 0) this.transferEnergy((terminal && terminal.store.energy < terminalEnergy) ? terminal : storage);
    }

    run() {
        if(!this.creep.ticksToLive) return;
        let storage: StructureContainer | StructureStorage | null = Game.getObjectById(this.creep.room.memory.storage);
        if(!storage) return;
        if (this.creep.ticksToLive < 10) {
            this.transferAll(storage);
            return;
        }

        this.store = this.creep.store;
        this.room = this.creep.room;
        this.storage = storage;
        this.terminal = this.room.terminal as any;
        this.memory = this.creep.memory;

        if(!this.memory.state || this.memory.state == 'none') this.judgeState();

        if(this.memory.state == 'tower') {
            this.fillTower();
            return;
        }
        if(this.memory.state == 'link') {
            this.link();
            return;
        }

        if(!this.terminal) {
            this.clearState();
            return;
        }

        // if(this.creep.room.name == 'E23N41') {
        //     let labs = this.creep.room.labs.filter(lab => !!lab.mineralType);
        //     if(labs.length) {
        //         if(this.creep.pos.isNearTo(labs[0])) this.creep.withdraw(labs[0], labs[0].mineralType as any);
        //         else this.creep.travelTo(labs[0])
        //     }
        //     return;
        // }

        switch (this.memory.state) {
            case 'ps':
                this.fillPowerSpawn();
                break;
            case 'nuker':
                this.fillNuker();
                break;
            case 'correct':
                this.correct();
                break;
            case 'deal':
                this.deal();
                break;
            case 'balance':
                this.balance();
                break;
            case 'carry':
                this.carry();
                break;
            case 'boost':
                this.boost();
                break;
            case 'labE':
                this.labE();
                break;
            default:
                break;
        }

        let powerSpawn = this.room.powerSpawn;
        if(powerSpawn){
            if(storage.energy > 700000) powerSpawn.processPower();
        }
    }

    judgeState() {
        if(this.room.towers.filter(tower => tower.energy < 600).length) {
            this.setState('tower');
            return;
        }

        let upLink = Game.getObjectById<StructureLink>(this.room.memory.upgradeLink);
        let link = Game.getObjectById<StructureLink>(this.room.memory.centerLink);
        if(upLink && link && upLink.store.energy < 600){
            this.setState('link');
            return;
        }
        if(link && link.store.energy > 0){
            this.setState('link');
            return;
        }

        if(!this.terminal) return;

        let labs = new RoomPlanner(this.room.name).getLabs();
        if(_.some(labs, lab => lab.energy < lab.energyCapacity * 0.5)) {
            this.setState('labE');
            return;
        }

        let processBoost = Process.getProcess(this.room.name, 'boost');
        if(processBoost) {
            this.setState('boost');
            return;
        }

        if(Game.shard.name == 'shard0') return;
        let powerSpawn = this.room.powerSpawn;
        if(powerSpawn) {
            if(powerSpawn.store.energy < 1000 || powerSpawn.store.getUsedCapacity(RESOURCE_POWER) == 0 && this.terminal.store.power) {
                this.setState('ps');
                return;
            }
        }

        let nuker = this.room.nuker;
        if(nuker) {
            if(nuker.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.storage.store.energy) {
                this.setState('nuker');
                return;
            }
            if(this.terminal.store.G && nuker.store.getFreeCapacity(RESOURCE_GHODIUM)) {
                this.setState('nuker');
                return;
            }
        }

        if(this.terminal.store.ops || this.storage.store.getUsedCapacity() - this.storage.store.energy - this.storage.store.getUsedCapacity(RESOURCE_OPS) > 0) {
            this.setState('correct');
            return;
        }

        let roomName = this.room.name;
        let market = Memory.market[roomName];

        if(market.buyOrder || market.sellOrder) {
            this.setState('deal');
            return;
        }

        if(market.transport) {
            this.setState('carry');
            return;
        }

        if(this.terminal.store.energy < terminalEnergy - 10000 || this.terminal.store.energy > terminalEnergy + 10000) {
            this.setState('balance');
            return;
        }
    }

    fillTower() {
        if(!this.storage) {
            this.clearState();
            return;
        }
        let towers = _.filter(this.room.towers, tower => tower.energy < 600);
        if(towers.length){
            let remain = 1000 - towers[0].energy;
            // console.log(remain);
            if(this.store.energy < remain){
                this.getEnergy(this.storage, remain - this.store.energy);
                if(!(this.creep.pos.getRangeTo(this.storage) > 1 && this.store.energy == 0)) this.transferEnergy(towers[0], remain);
                return;
            } else this.transferEnergy(towers[0], remain);
            return;
        }
        if(this.store.energy) {
            this.transferEnergy(this.storage);
            return;
        }

        this.clearState();
    }

    fillNuker() {
        let nuker = this.room.nuker;
        if(!nuker) {
            this.clearState();
            return;
        }
        if(nuker.store.getFreeCapacity(RESOURCE_ENERGY)){
            if(this.storage.store.energy || this.store.energy){
                let remain = nuker.store.getFreeCapacity(RESOURCE_ENERGY);
                if(!this.store.energy) {
                    this.get(this.storage, RESOURCE_ENERGY, remain);
                    if(this.creep.pos.isNearTo(this.storage)) this.transfer(nuker, RESOURCE_ENERGY, remain);
                }
                if(this.store.energy) {
                    this.transfer(nuker, RESOURCE_ENERGY, remain);
                    if(this.creep.pos.isNearTo(nuker)) this.get(this.storage, RESOURCE_ENERGY, remain);
                }
                return;
            } else this.clearState();
            return;
        }
        if(nuker.store.getFreeCapacity(RESOURCE_GHODIUM)){
            if(this.terminal.store.G || this.store.G){
                let remain = nuker.store.getFreeCapacity(RESOURCE_GHODIUM);
                if(!this.store.G) this.get(this.terminal, RESOURCE_GHODIUM, remain);
                if(this.store.G) this.transfer(nuker, RESOURCE_GHODIUM, remain);
                return;
            } else this.clearState();
            return;
        }
        if(this.store.energy) {
            this.transferEnergy(this.storage);
            return;
        }
        this.clearState();
    }

    link() {
        let link = Game.getObjectById<StructureLink>(this.room.memory.centerLink);
        let upLink = Game.getObjectById<StructureLink>(this.room.memory.upgradeLink);
        if(upLink && link && upLink.store.energy < 600){
            let remain = upLink.store.getCapacity(RESOURCE_ENERGY) - upLink.store.energy - link.store.energy;
            if(remain <= 0) { link.transferEnergy(upLink); return; }
            if(this.store.energy < remain) this.getEnergy(this.storage, remain);
            else this.transferEnergy(link, remain);
            return;
        }
        if(this.store.energy) {
            this.transferEnergy(this.storage);
            return;
        }

        if(link && link.store.energy > 0){
            this.getEnergy(link);
            return;
        }

        this.clearState();
    }

    fillPowerSpawn() {
        let powerSpawn = this.room.powerSpawn;
        if(!powerSpawn) {
            this.clearState();
            return;
        }

        if(powerSpawn.store.energy < powerSpawn.store.getCapacity(RESOURCE_ENERGY) - 1000){
            let remain = powerSpawn.store.getCapacity(RESOURCE_ENERGY) - powerSpawn.store.energy;
            if(!this.creep.store.energy) this.getEnergy(this.storage, remain);
            else this.transferEnergy(powerSpawn, remain);
            return;
        }
        if(powerSpawn.store.getUsedCapacity(RESOURCE_POWER) == 0 && (this.terminal.store.power || this.store.power)){
            let remain = powerSpawn.store.getCapacity(RESOURCE_POWER);
            if(!this.creep.store.getUsedCapacity(RESOURCE_POWER)) this.get(this.terminal, RESOURCE_POWER, remain);
            else this.transfer(powerSpawn, RESOURCE_POWER, remain);
            return;
        }

        this.clearState();
    }

    correct() {
        if(!this.storage || !this.terminal) {
            this.clearState();
            return;
        }

        if(this.storage.store.getUsedCapacity() - this.storage.store.energy - this.storage.store.getUsedCapacity(RESOURCE_OPS) > 0){
            for (const key in this.storage.store) {
                if(key == RESOURCE_ENERGY || key == RESOURCE_OPS) continue;
                this.get(this.storage, key as any);
            }
            this.transferAll(this.terminal);
            return;
        }
        if(this.store.getUsedCapacity() - this.store.getUsedCapacity(RESOURCE_OPS) > 0) {
            this.transferAll(this.terminal);
            return
        }
        if(this.store.getUsedCapacity(RESOURCE_OPS)){
            this.transfer(this.storage, RESOURCE_OPS);
            return;
        }
        if(this.terminal.store.getUsedCapacity(RESOURCE_OPS)){
            this.get(this.terminal, RESOURCE_OPS);
            return;
        }

        this.clearState();
    }

    deal() {
        if(!this.storage || !this.terminal) {
            this.clearState();
            return;
        }

        let roomName = this.room.name;
        let market = Memory.market[roomName];
        if (market.buyOrder) {
            let order = Game.market.getOrderById(market.buyOrder);
            if (!order || order.amount == 0)
                Market.cancelOrder(market, 'buy', 'invalid order');
            else {
                if(order.resourceType == SUBSCRIPTION_TOKEN) return;
                let tstore = this.terminal.store.getUsedCapacity(order.resourceType);
                let sstore = this.storage.store.getUsedCapacity(order.resourceType);
                if(!order.roomName) return;
                if(tstore == undefined) tstore = 0;
                if(sstore == undefined) sstore = 0;
                if (tstore >= market.buyAmount) {
                    let need = Game.market.calcTransactionCost(market.buyAmount, order.roomName, roomName)
                        + (order.resourceType == RESOURCE_ENERGY ? market.buyAmount : 0);
                    if (need <= this.terminal.store.energy && this.terminal.cooldown == 0){
                            Game.market.deal(order.id, market.buyAmount, roomName);
                            Market.finishOrder(market, order, roomName);
                    }
                    else {
                        if(this.store.getUsedCapacity() - this.store.energy > 0){
                            this.transferAll(this.terminal);
                            return;
                        }
                        let remain = need - this.terminal.store.energy;
                        this.getEnergy(this.storage, remain);
                        this.transferEnergy(this.terminal, remain);
                    }
                } else {
                    if(this.store[order.resourceType] == 0) this.get(this.storage, order.resourceType as ResourceConstant);
                    if(this.store[order.resourceType] > 0) this.transfer(this.terminal, order.resourceType as ResourceConstant);
                }
            }
            return;
        }
        else if (market.sellOrder) {
            let order = Game.market.getOrderById(market.sellOrder);
            if (!order || order.amount == 0)
                Market.cancelOrder(market, 'sell', 'invalid order');
            else {
                if(!order.roomName) return;
                if (Game.market.credits >= order.price * market.sellAmount) {
                    let need = Game.market.calcTransactionCost(market.sellAmount, order.roomName, roomName)
                        + (order.resourceType == RESOURCE_ENERGY ? market.sellAmount : 0);
                    if (need <= this.terminal.store.energy && this.terminal.cooldown == 0){
                            Game.market.deal(order.id, market.sellAmount, roomName);
                            Market.finishOrder(market, order, roomName);
                    }
                    else {
                        let remain = need - this.terminal.store.energy;
                        this.getEnergy(this.storage, remain);
                        this.transferEnergy(this.terminal, remain);
                    }
                }
            }
            return;
        }

        this.clearState();
    }

    balance() {
        if(!this.storage || !this.terminal) {
            this.clearState();
            return;
        }
        if(Memory.market[this.room.name].transport && Memory.market[this.room.name].transport.type == RESOURCE_ENERGY) {
            this.clearState();
            return;
        }
        if(Process.getProcess(this.room.name, 'boost')) {
            if(this.creep.store.getUsedCapacity()) {
                this.transferAll(this.storage);
                return;
            }
            this.clearState();
            return;
        }
        if (this.terminal.store.energy < terminalEnergy - 10000){
            let remain = terminalEnergy - this.terminal.store.energy;
            if(this.store.energy == 0) this.getEnergy(this.storage, remain);
            if(this.store.energy > 0) this.transfer(this.terminal, RESOURCE_ENERGY);
            return;
        }

        if (this.terminal.store.energy > terminalEnergy + 10000){
            let remain = this.terminal.store.energy - terminalEnergy;
            if(this.store.energy == 0) this.getEnergy(this.terminal, remain);
            if(this.store.energy > 0) this.transfer(this.storage, RESOURCE_ENERGY);
            return;
        }

        if(this.creep.store.energy) {
            this.transfer(this.storage, RESOURCE_ENERGY);
            return;
        }

        this.clearState();
    }

    carry() {
        if(!this.storage || !this.terminal) {
            this.clearState();
            return;
        }

        let roomName = this.room.name;
        let market = Memory.market[roomName];
        let transport = market.transport;
        if(transport){
            let tstore = this.terminal.store.getUsedCapacity(transport.type);
            let fare = Game.market.calcTransactionCost(transport.amount, roomName, transport.des);
            let neededAmount = transport.amount + (transport.type == RESOURCE_ENERGY ? fare : 0);
            if(tstore >= neededAmount) {
                this.terminal.send(transport.type, transport.amount, transport.des);
                delete market.transport;
                return;
            }
            if(!this.creep.store.getUsedCapacity(transport.type)) this.get(this.storage, transport.type, neededAmount - this.terminal.store.getUsedCapacity(transport.type));
            else this.transfer(this.terminal, transport.type, neededAmount - this.terminal.store.getUsedCapacity(transport.type));
            return;
        }
        if(this.creep.store.getUsedCapacity()) {
            this.transferAll(this.storage);
            return;
        }

        this.clearState();
    }

    boost() {
        let processBoost = Process.getProcess(this.room.name, 'boost') as ProcessBoost;
        if(!processBoost) {
            if(this.creep.store.getUsedCapacity()) {
                this.transferAll(this.terminal);
                return;
            } else {
                this.clearState();
                return;
            }
        }
        if(!this.fillingState) this.fillingState = 'get';
        // this.creep.say(this.fillingState);
        let boostState = processBoost.boostState;
        let rp = new RoomPlanner(this.room.name);
        let labs = rp.getLabs();
        if(boostState == 'filling') {
            let remain = this.getDemandList(labs, Game.creeps[processBoost.creepName], processBoost.compoundTypes);
            // console.log(JSON.stringify(remain));
            if(_.sum(remain) <= 0 && !this.creep.store.getUsedCapacity()) {
                processBoost.setBoostState('boosting');
                return;
            }
            if(this.fillingState == 'get') {
                if(_.sum(remain) <= 0 || !this.creep.store.getFreeCapacity()) {
                    this.fillingState = 'fill';
                } else {
                    for (const key in remain) {
                        if (remain.hasOwnProperty(key)) {
                            const num = remain[key];
                            if(!num) continue;
                            // console.log(key, num);
                            this.get(key == RESOURCE_ENERGY ? this.storage : this.terminal, key as ResourceConstant, num);
                            break;
                        }
                    }
                }
            }

            if(this.fillingState == 'fill') {
                for (let i = 0; i < processBoost.compoundTypes.length; i++) {
                    const compound = processBoost.compoundTypes[i];
                    let demand = this.getBoostDemand(Game.creeps[processBoost.creepName], compound);
                    if(labs[i].store.energy < demand.energy && this.creep.store.energy) {
                        this.transfer(labs[i], RESOURCE_ENERGY, demand.energy - labs[i].energy);
                        return;
                    }
                    // if(labs[i].mineralType) continue;
                    if(!this.creep.store.getUsedCapacity(compound)) continue;
                    this.transfer(labs[i], compound);
                    return;
                }
                if(!this.creep.store.getUsedCapacity()) this.fillingState = 'get';
            }
        }

        if(boostState == 'withdrawing') {
            if(!this.creep.store.getFreeCapacity()) this.fillingState = 'fill';
            if(this.fillingState == 'get') {
                for (const lab of labs) {
                    if(lab.mineralType) {
                        this.get(lab, lab.mineralType);
                        return;
                    }
                }
                if(!this.creep.store.getUsedCapacity()) {
                    processBoost.setBoostState('done');
                    this.clearState();
                    return;
                }
                this.fillingState = 'fill';
            }

            if(this.fillingState == 'fill') {
                this.transferAll(this.terminal);
                if(!this.creep.store.getUsedCapacity()) {
                    this.fillingState = 'get';
                    return;
                }
            }
        }
    }

    labE() {
        if(!this.storage) {
            this.clearState();
            return;
        }
        let labs = new RoomPlanner(this.room.name).getLabs();
        if(!_.some(labs, lab => !!lab.store.getFreeCapacity(RESOURCE_ENERGY))) {
            this.clearState();
            return;
        }
        if(!this.creep.store.energy) {
            let remain = _.sum(labs, lab => lab.store.getFreeCapacity(RESOURCE_ENERGY));
            this.getEnergy(this.storage, remain);
            return;
        } else {
            for (const lab of labs) {
                if(lab.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    this.transfer(lab, RESOURCE_ENERGY, lab.store.getFreeCapacity(RESOURCE_ENERGY));
                    return;
                }
            }
        }
    }

    setState(state: 'none' | 'link' | 'ps' | 'deal' | 'nuker' | 'tower' | 'carry' | 'balance' | 'correct' | 'boost' | 'factory' | 'lab' | 'labE') {
        this.memory.state = state;
    }

    clearState() {
        this.memory.state = 'none';
    }

    getDemandList(labs: StructureLab[], creep: Creep, compoundTypes: MineralBoostConstant[]): {[resource: string]: number}{
        let result = {};
        let energy = 0;
        for (let i = 0; i < compoundTypes.length; i++) {
            const compound = compoundTypes[i];
            let part = getTargetBodyPart(compound);
            let mineralType = labs[i].mineralType;
            energy += creep.bodyCounts[part] * 20 - labs[i].store.energy - this.creep.store.energy;
            let remain = creep.bodyCounts[part] * 30 - (mineralType != null ? labs[i].store[mineralType] : 0) - this.creep.store.getUsedCapacity(compound);
            result[compound] = remain <= 0 ? 0 : remain;
        }
        result[RESOURCE_ENERGY] = energy <= 0 ? 0 : energy;
        return result;
    }

    getBoostDemand(creep: Creep, compound: MineralBoostConstant): {compound: number, energy: number}{
        let part = getTargetBodyPart(compound);
        return { compound: creep.bodyCounts[part] * 30, energy: creep.bodyCounts[part] * 20};
    }

    getEnergy(target: AnyStructure, amount?: number){
        if(!target) return;
        if(this.creep.pos.getRangeTo(target) != 1){
            this.creep.travelTo(target);
            return;
        }
        let store = 0;
        if(isStoreStructure(target)) store = target.store.energy;
        if(store == 0) return;
        amount = Math.min(this.creep.store.getFreeCapacity(), amount || this.creep.store.getCapacity(), store);
        if(amount <= 0) return;
        // console.log(amount);
        this.creep.withdraw(target, RESOURCE_ENERGY, amount);
    }

    transferEnergy(target: AnyStructure | undefined, amount?: number){
        if(!target) return;
        if(this.creep.pos.getRangeTo(target) > 1){
            this.creep.travelTo(target);
            return;
        }
        amount = Math.min(this.creep.store.energy, amount || this.creep.store.energy);
        if(amount <= 0) return;
        this.creep.transfer(target, RESOURCE_ENERGY, amount);
    }

    get(target: AnyStructure, type: ResourceConstant, amount?: number){
        if(!target) return;
        if(this.creep.pos.getRangeTo(target) != 1){
            this.creep.travelTo(target);
            return;
        }
        let store = 0;
        if(isStoreStructure(target)) store = target.store.getUsedCapacity(type);
        if(!store) return;
        amount = Math.min(this.creep.store.getFreeCapacity(), amount || this.creep.store.getCapacity(), store);
        if(amount <= 0) return;
        // console.log(amount);
        this.creep.withdraw(target, type, amount);
    }

    transfer(target: AnyStructure | undefined, type: ResourceConstant, amount?: number){
        if(!target) return;
        if(this.creep.pos.getRangeTo(target) > 1){
            this.creep.travelTo(target);
            return;
        }
        amount = Math.min(this.creep.store.getUsedCapacity(type), amount || Infinity);
        if(amount <= 0) return;
        this.creep.transfer(target, type, amount);
    }

    transferAll(target: AnyStructure | undefined) {
        if(!target) return;
        if(this.creep.store.getUsedCapacity() == 0) return;
        for (const key in this.creep.store) {
            if (this.creep.transfer(target, key as ResourceConstant) == ERR_NOT_IN_RANGE) {
                this.creep.travelTo(target);
                return;
            }
        }
    }

    withdrawAll(target: StructureStorage | StructureTerminal | StructureContainer, includeEnergy: boolean){
        if(!target) return;
        for (const key in target.store) {
            if(!includeEnergy && key == RESOURCE_ENERGY) continue;
            if (this.creep.withdraw(target, key as ResourceConstant) == ERR_NOT_IN_RANGE) {
                this.creep.travelTo(target);
                return;
            }
        }
    }
}