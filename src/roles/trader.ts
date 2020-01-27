import { Role } from "./role";
import { GlobalSettings } from "../globalSettings";
import { profile } from "../profiler/decorator";
import { Market } from "../extensions/market";

const terminalEnergy = 50000;

@profile
export class RoleTrader extends Role {
    run() {
        // if(1)return;
        // // if(this.creep.room.name != 'E49N22') return;
        // if(!this.creep.ticksToLive)return;
        // if (this.creep.ticksToLive < 3) {
        //     this.transfer(this.creep.room.storage);
        //     return;
        // }
        // let market = Memory.market[this.creep.room.name];
        // if(!Memory.rooms[this.creep.room.name].traderPos) return;
        // let pos = Memory.rooms[this.creep.room.name].traderPos;
        // if (!this.creep.pos.isEqualTo(pos)) {
        //     this.creep.travelTo(pos);
        //     return;
        // }
        // if(!market) return;
        // let terminal = this.creep.room.terminal;
        // let storage = this.creep.room.storage;
        // if (!terminal || !storage) return;

        // // if(this.creep.room.name == 'E49N22'){
        // //     if(_.sum(this.creep.carry) > 0){
        // //         this.transfer(storage);
        // //     }else this.withdraw(terminal, true);
        // //     return;
        // // }

        // // return;
        // if(_.sum(storage.store) - storage.store.energy > 0){
        //     this.withdraw(storage, false);
        //     this.transfer(terminal);
        //     return;
        // }
        // if (market.buyOrder) {
        //     let order = Game.market.getOrderById(market.buyOrder);
        //     if (!order || order.amount == 0)
        //         Market.cancelOrder(market, 'buy', 'invalid order');
        //     else {
        //         let tstore = terminal.store[order.resourceType];
        //         let sstore = storage.store[order.resourceType];
        //         if(!order.roomName) return;
        //         if(tstore == undefined) tstore = 0;
        //         if(sstore == undefined) sstore = 0;
        //         if (tstore >= market.buyAmount) {
        //             let need = Game.market.calcTransactionCost(market.buyAmount, order.roomName, this.creep.room.name)
        //                 + (order.resourceType == RESOURCE_ENERGY ? market.buyAmount : 0);
        //             if (need <= terminal.store.energy && terminal.cooldown == 0){
        //                     Game.market.deal(order.id, market.buyAmount, this.creep.room.name);
        //                     Market.finishOrder(market, order, this.creep.room.name);
        //             }
        //             else {
        //                 if(_.sum(this.creep.carry) - this.creep.carry.energy > 0){
        //                     this.transfer(terminal);
        //                     return;
        //                 }
        //                 let remain = need - terminal.store.energy;
        //                 this.creep.withdraw(storage, RESOURCE_ENERGY, Math.min(this.creep.store.getUsedCapacity(), remain) - _.sum(this.creep.carry));
        //                 this.creep.transfer(terminal, RESOURCE_ENERGY, Math.min(this.creep.store.getUsedCapacity(), remain));
        //             }
        //         } else {
        //             this.creep.withdraw(storage, order.resourceType as ResourceConstant);
        //             this.creep.transfer(terminal, order.resourceType as ResourceConstant);
        //         }
        //     }
        //     return;
        // }
        // else if (market.sellOrder) {
        //     let order = Game.market.getOrderById(market.sellOrder);
        //     if (!order || order.amount == 0)
        //         Market.cancelOrder(market, 'sell', 'invalid order');
        //     else {
        //         if(!order.roomName) return;
        //         if (Game.market.credits >= order.price * market.sellAmount) {
        //             let need = Game.market.calcTransactionCost(market.sellAmount, order.roomName, this.creep.room.name)
        //                 + (order.resourceType == RESOURCE_ENERGY ? market.sellAmount : 0);
        //             if (need <= terminal.store.energy && terminal.cooldown == 0){
        //                     Game.market.deal(order.id, market.sellAmount, this.creep.room.name);
        //                     Market.finishOrder(market, order, this.creep.room.name);
        //             }
        //             else {
        //                 let remain = need - terminal.store.energy;
        //                 this.creep.withdraw(storage, RESOURCE_ENERGY, Math.min(this.creep.store.getUsedCapacity(), remain) - _.sum(this.creep.carry));
        //                 this.creep.transfer(terminal, RESOURCE_ENERGY, Math.min(this.creep.store.getUsedCapacity(), remain));
        //             }
        //         }
        //     }
        //     return;
        // }
        
        // let transport = market.transport;
        // if(transport){
        //     let store = terminal.store[transport.type];
        //     this.creep.withdraw(storage, transport.type);
        //     this.creep.transfer(terminal, transport.type);
        //     if(store && store >= transport.amount) {
        //         let fare = Game.market.calcTransactionCost(transport.amount, this.creep.room.name, transport.des);
        //         terminal.send(transport.type, transport.amount - fare, transport.des);
        //         // terminal.send(transport.type, transport.amount, transport.des);
        //         delete market.transport;
        //     }
        //     return;
        // }

        // if (terminal.store.energy > terminalEnergy){
        //     let remain = terminal.store.energy - terminalEnergy;
        //     this.creep.withdraw(terminal, RESOURCE_ENERGY, Math.min(this.creep.store.getUsedCapacity() - _.sum(this.creep.carry), remain));
        //     this.creep.transfer(storage, RESOURCE_ENERGY);
        //     return;
        // }
        // if (terminal.store.energy < terminalEnergy){
        //     let remain = terminalEnergy - terminal.store.energy;
        //     this.creep.withdraw(storage, RESOURCE_ENERGY, Math.min(this.creep.store.getUsedCapacity() - _.sum(this.creep.carry), remain));
        //     this.creep.transfer(terminal, RESOURCE_ENERGY);
        //     return;
        // }
        // if(this.creep.carry.energy > 0)
        //     this.creep.transfer(storage, RESOURCE_ENERGY);
    }

    transfer(target) {
        for (const key in this.creep.store) {
            if (this.creep.transfer(target, key as ResourceConstant) == ERR_NOT_IN_RANGE) {
                this.creep.travelTo(target);
                return;
            }
        }
    }

    withdraw(target: StructureStorage | StructureTerminal, includeEnergy: boolean){
        for (const key in target.store) {
            if(!includeEnergy && key == RESOURCE_ENERGY) continue;
            if (this.creep.withdraw(target, key as ResourceConstant) == ERR_NOT_IN_RANGE) {
                this.creep.travelTo(target);
                return;
            }
        }
    }
}