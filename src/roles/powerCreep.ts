import { profile } from "../profiler/decorator";
import { RoleManager } from "./manager";
import { isPowerEffect, isStoreStructure } from "../declarations/typeGuards";
import { Process } from "../process/process";
import { Traveler } from "../programs/Traveler";

@profile
export class RolePC{
    creep: PowerCreep;

    constructor(pc: PowerCreep){
        this.creep = pc;
    }

    run(){
        if(this.creep.name == 'PC_WAR') this.runWar();
        else this.runNormal();

        // if(this.creep.powers[PWR_OPERATE_POWER] && this.creep.powers[PWR_OPERATE_POWER].cooldown == 0 && room.powerSpawn){
        //     let terminal = room.terminal;
        //     let storage = room.storage;
        //     if(terminal && storage && (this.creep.carry.ops || 0) >= 400 && (terminal.store.power || 0) >= 10000 && storage.store.energy > 600000){
        //         if(!this.creep.pos.inRangeTo(room.powerSpawn, 3)) this.creep.travelTo(room.powerSpawn, { offRoad: true, range: 3 });
        //         else this.creep.usePower(PWR_OPERATE_POWER, room.powerSpawn);
        //         return;
        //     }
        // }

        // if(this.creep.powers[PWR_REGEN_MINERAL]){
        //     let mineral = Game.getObjectById<Mineral>(room.memory.mineral.mineralId);
        //     if(mineral){
        //         if(!mineral.effects || !mineral.effects.find(effect => effect.effect == PWR_REGEN_MINERAL && effect.ticksRemaining > 30)){
        //             if(!this.creep.pos.inRangeTo(mineral, 3)) this.creep.travelTo(mineral, { offRoad: true, range: 3 });
        //             else this.creep.usePower(PWR_REGEN_MINERAL, mineral);
        //             return;
        //         }
        //     }
        // }
    }

    runNormal() {
        let room = this.creep.room;
        let controller = room ? room.controller : undefined;
        if(!room) return;

        if(this.creep.ticksToLive && this.creep.ticksToLive < 1000 && room.powerSpawn){
            if(!this.creep.pos.inRangeTo(room.powerSpawn, 1)) this.creep.travelTo(room.powerSpawn, { offRoad: true });
            else this.creep.renew(room.powerSpawn);
            return;
        }
        
        if(controller && !controller.isPowerEnabled){
            if(!this.creep.pos.inRangeTo(controller, 1)) this.creep.travelTo(controller, { offRoad: true });
            else this.creep.enableRoom(controller);
            return;
        }

        let storage = room.storage;
        if(storage && storage.store.getUsedCapacity(RESOURCE_OPS) && this.creep.store.getUsedCapacity(RESOURCE_OPS) < this.creep.store.getCapacity() * 0.5){
            if(!this.creep.pos.inRangeTo(storage, 1)) this.creep.travelTo(storage);
            else this.creep.withdraw(storage, RESOURCE_OPS, this.creep.store.getCapacity() * 0.5 - this.creep.store.getUsedCapacity(RESOURCE_OPS));
            return;
        }

        if(this.creep.powers[PWR_REGEN_SOURCE]){
            for (const source of room.find(FIND_SOURCES, { 
                filter: source => !source.effects || source.effects.filter(effect => 
                    isPowerEffect(effect) && effect.power == PWR_REGEN_SOURCE && effect.ticksRemaining > 30).length == 0})) {
                if(!this.creep.pos.inRangeTo(source, 3)) this.creep.travelTo(source, { offRoad: true, range: 3 });
                else this.creep.usePower(PWR_REGEN_SOURCE, source);
                return;
            }
        }

        let factory = room.factory;
        let terminal = room.terminal;
        if(storage && factory && terminal){
            if(Memory.industry[room.name]){
                let state = Memory.industry[room.name];
                if(state.producing && (COMMODITIES[state.type] as any).level && !factory.cooldown
                    && (!factory.effects || !factory.effects.length) && this.creep.powers[PWR_OPERATE_FACTORY] && !this.creep.powers[PWR_OPERATE_FACTORY].cooldown){
                    if(this.creep.pos.getRangeTo(factory) > 3) this.creep.travelTo(factory, { range: 3});
                    else this.creep.usePower(PWR_OPERATE_FACTORY, factory);
                    return;
                }
                if(state.preparing){
                    for (const component in COMMODITIES[state.type].components) {
                        if (COMMODITIES[state.type].components.hasOwnProperty(component)) {
                            const num = COMMODITIES[state.type].components[component] * (state.amount / COMMODITIES[state.type].amount);
                            const remain = num - (factory.store[component] || 0)
                            // console.log(num, component, state.amount);
                            if((factory.store[component] || 0) >= num) continue;
                            if((this.creep.store[component] || 0) > 0) {
                                this.transfer(factory, component as any, remain);
                                return;
                            }
                            if((terminal.store[component] || 0) >= remain) {
                                if(this.creep.store.getFreeCapacity() == 0){
                                    for (const type in this.creep.store) {
                                        if(!COMMODITIES[state.type].components[type]) {
                                            this.transfer(terminal, type as any);
                                        }
                                    }
                                }
                                this.get(terminal, component as any, remain);
                                // console.log(num - (factory.store[component] || 0), num, factory.store[component])
                                return;
                            }
                        }
                    }
                }
            }
            if(this.creep.store.getUsedCapacity() - this.creep.store.getUsedCapacity(RESOURCE_OPS) > 0){
                for (const type in this.creep.store) {
                    if (this.creep.store.hasOwnProperty(type)) {
                        if(type == RESOURCE_OPS) continue;
                        this.transfer(terminal, type as any);
                        return;
                    }
                }
            }
            let state = Memory.industry[room.name];
            let components = {} as any;
            if(state) components = COMMODITIES[state.type].components;
            for (const type in factory.store) {
                if (factory.store.hasOwnProperty(type)) {
                    if(!components[type]) {
                        this.get(factory, type as any);
                        return;
                    }
                }
            }
        }

        if(this.creep.powers[PWR_GENERATE_OPS] && storage){
            if(this.creep.store.getUsedCapacity(RESOURCE_OPS) + storage.store.getUsedCapacity(RESOURCE_OPS) < 100000){
                if(this.creep.powers[PWR_GENERATE_OPS].cooldown == 0) this.creep.usePower(PWR_GENERATE_OPS);
            }
            if(this.creep.store.getUsedCapacity(RESOURCE_OPS) > this.creep.store.getCapacity() * 0.9){
                if(!this.creep.pos.inRangeTo(storage, 1)) this.creep.travelTo(storage);
                else this.creep.transfer(storage, RESOURCE_OPS, this.creep.store.getCapacity() * 0.4);
                return;
            }
        }

        if(this.creep.powers[PWR_OPERATE_EXTENSION] && room.storage){
            if(room.energyAvailable < room.energyCapacityAvailable && this.creep.powers[PWR_OPERATE_EXTENSION].cooldown == 0){
                if(this.creep.memory.lastEnergy > room.energyAvailable){
                    this.creep.memory.lastEnergy = room.energyAvailable;
                    return;
                } else this.creep.memory.lastEnergy = room.energyAvailable;
                if(!this.creep.pos.inRangeTo(room.storage, 3)) this.creep.travelTo(room.storage, { offRoad: true, range: 3 });
                else this.creep.usePower(PWR_OPERATE_EXTENSION, room.storage);
                return;
            } else this.creep.memory.lastEnergy = room.energyAvailable;
        }
    }

    runWar() {
        let room = this.creep.room;
        let controller = room ? room.controller : undefined;
        if(!room) return;

        let defendMode = false;
        let warMode = false;

        let process = Process.getProcess(room.name, 'activeDefend');
        if(process && process.state == 'active') defendMode = true;
        if(Process.getProcess(room.name, 'attack')) warMode = true;

        let r = Game.rooms['W12N9'];
        if(r && r.find(FIND_NUKES).length) {
            if(_.min(r.find(FIND_NUKES), rr => rr.timeToLand).timeToLand < 200) {
                this.creep.travelTo(new RoomPosition(48, 47, 'W13N9'));
                return;
            }
        } else {
            if(room.name == 'W13N9') {
                this.creep.travelTo(new RoomPosition(25, 25, 'W12N9'));
                return;
            }
            if(this.creep.pos.isEdge) Traveler.avoidEdge(this.creep as any);
        }

        if(this.creep.ticksToLive && this.creep.ticksToLive < 4000 && room.powerSpawn){
            if(!this.creep.pos.inRangeTo(room.powerSpawn, 1)) this.creep.travelTo(room.powerSpawn, { offRoad: true });
            else this.creep.renew(room.powerSpawn);
            return;
        }
        
        if(controller && !controller.isPowerEnabled){
            if(!this.creep.pos.inRangeTo(controller, 1)) this.creep.travelTo(controller, { offRoad: true });
            else this.creep.enableRoom(controller);
            return;
        }

        let storage = room.storage;
        if(storage && storage.store.getUsedCapacity(RESOURCE_OPS) && this.creep.store.getUsedCapacity(RESOURCE_OPS) < this.creep.store.getCapacity() * 0.5){
            if(!this.creep.pos.inRangeTo(storage, 1)) this.creep.travelTo(storage);
            else this.creep.withdraw(storage, RESOURCE_OPS, this.creep.store.getCapacity() * 0.5 - this.creep.store.getUsedCapacity(RESOURCE_OPS));
            return;
        }

        if(this.creep.powers[PWR_GENERATE_OPS] && storage){
            if(this.creep.store.getUsedCapacity(RESOURCE_OPS) + storage.store.getUsedCapacity(RESOURCE_OPS) < 100000){
                if(this.creep.powers[PWR_GENERATE_OPS].cooldown == 0) this.creep.usePower(PWR_GENERATE_OPS);
            }
            if(this.creep.store.getUsedCapacity(RESOURCE_OPS) > this.creep.store.getCapacity() * 0.9){
                if(!this.creep.pos.inRangeTo(storage, 1)) this.creep.travelTo(storage);
                else this.creep.transfer(storage, RESOURCE_OPS, this.creep.store.getCapacity() * 0.4);
                return;
            }
        }

        if(this.creep.powers[PWR_OPERATE_SPAWN]) {
            if(warMode || defendMode) {
                let spawn = room.spawns.filter(spawn => !spawn.effects || !spawn.effects.length)[0];
                if(spawn) {
                    if(!this.creep.pos.inRangeTo(spawn, 3)) this.creep.travelTo(spawn, { offRoad: true, range: 3 });
                    else this.creep.usePower(PWR_OPERATE_SPAWN, spawn);
                    return;
                }
            }
        }

        if(this.creep.powers[PWR_OPERATE_EXTENSION] && room.storage){
            if(room.energyAvailable < room.energyCapacityAvailable && this.creep.powers[PWR_OPERATE_EXTENSION].cooldown == 0){
                if(this.creep.memory.lastEnergy > room.energyAvailable){
                    this.creep.memory.lastEnergy = room.energyAvailable;
                    return;
                } else this.creep.memory.lastEnergy = room.energyAvailable;
                if(!this.creep.pos.inRangeTo(room.storage, 3)) this.creep.travelTo(room.storage, { offRoad: true, range: 3 });
                else this.creep.usePower(PWR_OPERATE_EXTENSION, room.storage);
                return;
            } else this.creep.memory.lastEnergy = room.energyAvailable;
        }

        if(this.creep.powers[PWR_OPERATE_TOWER]) {
            if(defendMode) {
                let tower = room.towers.filter(tower => !tower.effects || !tower.effects.length)[0];
                if(tower) {
                    if(!this.creep.pos.inRangeTo(tower, 3)) this.creep.travelTo(tower, { offRoad: true, range: 3 });
                    else this.creep.usePower(PWR_OPERATE_TOWER, tower);
                    return;
                }
            }
        }
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
}