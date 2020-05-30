import { profile } from "../profiler/decorator";
import { RoleManager } from "./manager";
import { isPowerEffect, isStoreStructure } from "../declarations/typeGuards";
import { Process } from "../process/process";
import { Traveler } from "../programs/Traveler";
import { RoomPlanner } from "../roomPlanner/RoomPlanner";

@profile
export class RolePC{
    static roles: {[name: string]: RolePC} = {};
    static pcAbility: {[roomName: string]: {
        [PWR_OPERATE_EXTENSION]: {energySend: number, cooldown: boolean, role: RolePC}
    }} = {};

    creep: PowerCreep;
    
    extensionCapacity: number = 0;
    energySend: number = 0;
    cooldown: boolean = false;
    refillNeeded: boolean = false;

    constructor(pc: PowerCreep){
        this.creep = pc;
        let room = pc.room;
        if(room && pc.powers[PWR_OPERATE_EXTENSION] && room.extensions.length) {
            let power = pc.powers[PWR_OPERATE_EXTENSION];
            let percent = Math.min(POWER_INFO[PWR_OPERATE_EXTENSION].effect[power.level], 0.5);
            this.extensionCapacity = room.energyCapacityAvailable - room.spawns.length * 300;
            this.energySend = room.extensions.length * _.first(room.extensions).store.getCapacity(RESOURCE_ENERGY) * percent;
            this.cooldown = !!power.cooldown;
            RolePC.pcAbility[room.name] = {} as any;
            RolePC.pcAbility[room.name][PWR_OPERATE_EXTENSION] = {energySend: this.energySend, cooldown: this.cooldown, role: this};
        }
    }

    static getRole(creep: PowerCreep): RolePC {
        if(this.roles[creep.name]) {
            let role = this.roles[creep.name];
            role.creep = creep;
            return role;
        }
        return this.roles[creep.name] = new RolePC(creep);
    }

    run(){
        if(this.creep.name == 'PC_WAR') this.runWar();
        else if(this.creep.name.match('atanner')) this.runAtanner();
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

        if(this.creep.powers[PWR_OPERATE_EXTENSION] && room.storage){
            let power = this.creep.powers[PWR_OPERATE_EXTENSION];
            RolePC.pcAbility[room.name][PWR_OPERATE_EXTENSION].cooldown = this.cooldown = !!power.cooldown;
            if(this.cooldown) this.refillNeeded = false;
            if((room.energyAvailable < (room.energyCapacityAvailable - this.energySend) || this.refillNeeded) && (power.cooldown || 0) < 10){
                if(!this.creep.pos.inRangeTo(room.storage, 3)) this.creep.travelTo(room.storage, { offRoad: true, range: 3 });
                else this.creep.usePower(PWR_OPERATE_EXTENSION, room.storage);
                return;
            }
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
                            if((factory.store[component] || 0) >= num) continue;
                            if((this.creep.store[component] || 0) > 0) {
                                this.transfer(factory, component as any, remain);
                                return;
                            }
                            if((terminal.store[component] || 0) >= remain) {
                                if(this.creep.store.getFreeCapacity() == 0){
                                    for (const type in this.creep.store) {
                                        if(type == RESOURCE_OPS) continue;
                                        this.transfer(terminal, type as any);
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

        // if(this.creep.powers[PWR_OPERATE_LAB]) {
        //     let rp = new RoomPlanner(room.name);
        //     let lab = rp.getProductLabs().filter(lab => !lab.effects || !lab.effects.length)[0];
        //     if(lab) {
        //         if(!this.creep.pos.inRangeTo(lab, 3)) this.creep.travelTo(lab, { offRoad: true, range: 3 });
        //         else this.creep.usePower(PWR_OPERATE_LAB, lab);
        //         return;
        //     }
        // }
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
            let power = this.creep.powers[PWR_OPERATE_EXTENSION];
            RolePC.pcAbility[room.name][PWR_OPERATE_EXTENSION].cooldown = this.cooldown = !!power.cooldown;
            if(this.cooldown) this.refillNeeded = false;
            if((room.energyAvailable < (room.energyCapacityAvailable - this.energySend) || this.refillNeeded) && (power.cooldown || 0) < 10){
                if(!this.creep.pos.inRangeTo(room.storage, 3)) this.creep.travelTo(room.storage, { offRoad: true, range: 3 });
                else this.creep.usePower(PWR_OPERATE_EXTENSION, room.storage);
                return;
            }
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

    runAtanner() {
        let room = this.creep.room;
        let controller = room ? room.controller : undefined;
        if(!room) return;

        let pbRoom = 'W10N10';

        let ticksToLive = this.creep.ticksToLive;

        if(!ticksToLive) return;

        if(this.creep.powers[PWR_GENERATE_OPS] && !this.creep.powers[PWR_GENERATE_OPS].cooldown) {
            this.creep.usePower(PWR_GENERATE_OPS);
        }

        if(ticksToLive < 400) {
            if(room.name != pbRoom) {
                this.creep.travelTo(new RoomPosition(25, 25, pbRoom), {preferHighway: true});
                return;
            }
            let pb = this.creep.pos.findClosestByRange(room.powerBanks);
            if(pb) {
                if(!this.creep.pos.inRangeTo(pb, 1)) this.creep.travelTo(pb);
                else this.creep.renew(pb);
                return;
            }
            return;
        }
        if(this.creep.store.getFreeCapacity() && room.name == 'W12N9') {
            let storage = room.storage;
            if(!storage) return;
            if(!this.creep.pos.isNearTo(storage)) this.creep.travelTo(storage);
            else this.creep.withdraw(storage, RESOURCE_OPS);
            return;
        }

        if(Game.flags['bk']) {
            this.creep.travelTo(Game.flags['bk'], {range: 3});
            return;
        }

        if(this.creep.store.getUsedCapacity(RESOURCE_OPS) < 20) {
            if(room.name != 'W10N8') {
                this.creep.travelTo(new RoomPosition(25, 25, 'W10N8'), {preferHighway: true});
                return;
            }
            let container = this.creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: creep => creep.name.match('container')});
            if(container) {
                if(!this.creep.pos.inRangeTo(container, 1)){
                    this.creep.travelTo(container);
                    return;
                }
                return;
            } else {
                let resources = room.find(FIND_DROPPED_RESOURCES, {filter: r => r.resourceType == RESOURCE_OPS});
                if(resources.length) {
                    if(!this.creep.pos.isNearTo(resources[0])) this.creep.travelTo(resources[0]);
                    else this.creep.pickup(resources[0]);
                    return;
                } else {
                    let tombs = room.find(FIND_TOMBSTONES, {filter: r => !!r.store.ops});
                    if(tombs.length) {
                        if(!this.creep.pos.isNearTo(tombs[0])) this.creep.travelTo(tombs[0]);
                        else this.creep.withdraw(tombs[0], RESOURCE_OPS);
                        return;
                    }
                }
            }
            if(this.creep.pos.isEdge) {
                Traveler.avoidEdge(this.creep as any);
            }
            return;
        }

        if(room.name != 'W11N8') {
            this.creep.travelTo(new RoomPosition(25, 25, 'W11N8'));
            return;
        }
        if(this.creep.pos.isEdge) {
            Traveler.avoidEdge(this.creep as any);
            return;
        }

        if(this.creep.hits < this.creep.hitsMax) {
            this.creep.usePower(PWR_SHIELD);
        }

        if(this.creep.powers[PWR_DISRUPT_SPAWN]) {
            let pcs = room.find(FIND_MY_POWER_CREEPS, {filter: pc => !pc.powers[PWR_DISRUPT_SPAWN].cooldown});
            if(pcs.length > 1) {
                if(_.max(pcs, pc => this.getId(pc.name)).name == this.creep.name){
                    return;
                }
            }

            let spawns = room.spawns.filter(spawn => {
                if(!spawn.spawning) return false;
                if(!spawn.effects || !spawn.effects.length) return true;
                return !_.some(spawn.effects, e => e.effect == PWR_DISRUPT_SPAWN && e.ticksRemaining > 2);
            });
            let spawn = _.min(spawns, spawn => {
                let effect = _.find(spawn.effects, effect => effect.effect = PWR_DISRUPT_SPAWN);
                if(!effect) return 0;
                return effect.ticksRemaining;
            });
            if(spawn) {
                if(!this.creep.pos.inRangeTo(spawn, 20)) {
                    this.creep.travelTo(spawn);
                    return;
                } else this.creep.usePower(PWR_DISRUPT_SPAWN, spawn);
            }
        }
    }

    getId(name: string): number{
        return Number.parseInt(this.creep.name.split('-')[1]);
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