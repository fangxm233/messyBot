import { SourceManager } from "./sourceManager";
import { ErrorMapper } from "../utils/ErrorMapper";
import { Alloter, ALLOT_HARVEST, ALLOT_TRANSPORT, allotUnit, ALLOT_RESERVE, ALLOT_MINERAL_TRANSPORT, ALLOT_FILLER } from "../logistics/alloter";
import { Visualizer } from "./Visualizer";
import { GlobalSettings } from "../globalSettings";
import { profile } from "../profiler/decorator";
import { RoomPlanner, fillerCount } from "../roomPlanner/RoomPlanner";
import { Process } from "../process/process";
import { CreepWish } from "./creepWish";
import { RoleFactory } from "../roles/roleFactory";
import { ProcessFilling } from "../process/instances/filling";

@profile
export class CreepManager {
    static consumeOrder: {
        [roomName: string]: { id: Id<StructureSpawn | StructureExtension> }[];
    }
    static spawnInfo: { name: string, bodies: BodyPartConstant[], opts: any, spawn?: StructureSpawn, dir?: DirectionConstant } | undefined;

    static run(room: Room) {
        this.run_(room);
    }

    static clearUnexistingCreep() {
        for (const name in Memory.creeps) {
            if (name == 'sad') continue;
            if (!Game.creeps[name]) {
                this.clearCreep(name);
            }
        }
    }

    static clearCreep(name: string) {
        console.log('Clearing non-existing creep memory:', name);
        delete Memory.creeps[name];
        RoleFactory.removeRole(name);
    }

    static time: number = 0;
    static creepsForRoom: {
        [roomName: string]: {
            [role: string]: number
        }
    } = {};

    static run_(room: Room) {
        let controller = room.controller;
        let spawns = room.spawns;
        if (!controller) return;
        if (!spawns.length) return;
        // if(!room.storage && Memory.spawnRoom == room.name) return;

        if (this.time != Game.time) {
            this.creepsForRoom = {};
            this.time = Game.time;
            for (const creepName in Game.creeps) {
                if (Game.creeps.hasOwnProperty(creepName)) {
                    const creep = Game.creeps[creepName];
                    let roomName = creep.memory.spawnRoom;
                    let role = creep.memory.role;
                    if (role == 'manager' && creep.ticksToLive && creep.ticksToLive < creep.body.length * 3) continue;
                    if (!this.creepsForRoom[roomName]) this.creepsForRoom[roomName] = {};
                    if (!this.creepsForRoom[roomName][role]) this.creepsForRoom[roomName][role] = 0;
                    this.creepsForRoom[roomName][role]++;
                }
            }
        }

        if (!this.creepsForRoom[room.name]) this.creepsForRoom[room.name] = {};
        let creeps = this.creepsForRoom[room.name];

        for (const role of GlobalSettings.roles) {
            if (!creeps[role]) creeps[role] = 0;
        }

        let produceH = !Process.getProcess(room.name, 'activeDefend') && !Process.getProcess(room.name, 'attack');

        let avaEnergy = room.energyAvailable;
        let capEnergy = room.energyCapacityAvailable;
        if (creeps['filler'] < Alloter.getUnitCount(ALLOT_FILLER, room.name)) capEnergy = Math.max(avaEnergy, 300);
        if (creeps['harvester'] == 0 && room.memory.noEnergyAvailable) capEnergy = Math.max(avaEnergy, 300);

        let wishCreep = CreepWish.getWish(room.name);
        let wishCreepRole = '';
        if (wishCreep) wishCreepRole = wishCreep.role;

        //hauler
        if (wishCreepRole == 'hauler' || Memory.gotoHaul && Memory.haulerRoom == room.name && creeps['hauler'] < 2) {//Memory.gotoHaul && Memory.haulerRoom == room.name
            this.spawnInfo = undefined;
            let id = CreepManager.getId('hauler');
            this.setInfo(this.getBodies(['c1', 'm1'], capEnergy), 'hauler_' + id,
                { memory: this.getMemory('hauler', id, room.name) });
        }

        //dismantler
        if (wishCreepRole == 'dismantler' || Memory.gotoDismantle && Memory.dismantlerRoom == room.name && creeps['dismantler'] < 2) {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('dismantler');
            this.setInfo(this.getBodies(['c49', 'm1'], capEnergy), 'pcontainer_' + id,
                { memory: this.getMemory('dismantler', id, room.name) });
        }

        // wish cAttack
        if (wishCreepRole == 'cAttack') {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('cAttack');
            this.setInfo(this.getBodies(['C1', 'm1'], capEnergy), 'cAttack_' + id,
                { memory: this.getMemory('cAttack', id, room.name) });
        }

        //pioneer
        if (wishCreepRole == 'pioneer' || Memory.expandRoom == room.name && creeps['pioneer'] < 5) {//Memory.expandRoom == room.name &&
            this.spawnInfo = undefined;
            let id = CreepManager.getId('pioneer');
            let hasClaim = creeps['pioneer'] == 0 && !Memory.claimed;
            // hasClaim = false;
            let bodies = this.getBodies(['w1', 'c1', 'm2'], capEnergy);
            if (hasClaim) bodies = [CLAIM, MOVE];
            this.setInfo(bodies, 'pioneer_' + id,
                { memory: this.getMemory('pioneer', id, room.name) });
        }

        // wish powerAttack
        if (wishCreepRole == 'powerAttack') {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('powerAttack');
            let bodies = this.getBodies(['m1', 'a1'], 2600);
            this.setInfo(bodies, 'powerAttack_' + id,
                { memory: this.getMemory('powerAttack', id, room.name) });
        }

        // wish powerHealer
        if (wishCreepRole == 'powerHealer') {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('powerHealer');
            let bodies = this.getBodies(['m1', 'h1'], capEnergy);
            this.setInfo(bodies, 'powerHealer_' + id,
                { memory: this.getMemory('powerHealer', id, room.name) });
        }

        // wish powerRange
        if (wishCreepRole == 'powerRange') {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('powerRange');
            let bodies = [
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                MOVE, MOVE, MOVE, MOVE, MOVE,
                HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
                RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
                RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
                RANGED_ATTACK,
            ]
            this.setInfo(bodies, 'powerRange_' + id,
                { memory: this.getMemory('powerRange', id, room.name) });
        }

        // wish dHarvester
        if (wishCreepRole == 'dHarvester') {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('dHarvester');
            let bodies = this.getBodies(['w12', 'c1', 'm12'], capEnergy);
            this.setInfo(bodies, 'dHarvester_' + id,
                { memory: this.getMemory('dHarvester', id, room.name) });
        }

        // wish dTransporter
        if (wishCreepRole == 'dTransporter') {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('dTransporter');
            let bodies = this.getBodies(['c1', 'm1'], capEnergy);
            this.setInfo(bodies, 'dTransporter_' + id,
                { memory: this.getMemory('dTransporter', id, room.name) });
        }

        // wish container
        if (wishCreepRole == 'container') {
            this.spawnInfo = undefined;
            let id = CreepManager.getId('container');
            let bodies = this.getBodies(['c29', 'm1'], capEnergy);
            this.setInfo(bodies, 'container_' + id,
                { memory: this.getMemory('container', id, room.name) });
        }

        //trader
        // if(room.terminal && creeps['trader'].length < 0){
        //     this.spawnInfo = undefined;
        //     var id = CreepManager.getId('trader');
        //     var newName = 'trader_' + id;
        //     CreepManager.setInfo(this.getBodies(['c2', 'm1'], 1500), newName,
        //         { memory: this.getMemory('trader', id, room.name) });
        // }

        // reservist
        let reserve = SourceManager.allotReservist(room);
        if (wishCreepRole == 'reservist' || capEnergy >= 1300 && reserve && reserve.data.ticksToEnd < 3000) {
            this.spawnInfo = undefined;
            let budget = Math.min(capEnergy, 2600);
            let id = CreepManager.getId('reservist');
            this.setInfo(this.getBodies(['C1', 'm1'], budget), 'reservist_' + id,
                { memory: this.getMemory('reservist', id, room.name, { allotUnit: reserve }) });
        }
        if (reserve) Alloter.free(reserve);

        //mineral
        if (wishCreepRole == 'miner' || room.memory.mineral.extractorId) {
            let mineral = Game.getObjectById<Mineral>(room.memory.mineral.mineralId);
            if (mineral && mineral.mineralAmount > 0) {
                if (creeps['miner'] < 1) {
                    this.spawnInfo = undefined;
                    let id = CreepManager.getId('miner');
                    this.setInfo(this.getBodies(['w4', 'm1'], capEnergy), 'miner_' + id,
                        { memory: this.getMemory('miner', id, room.name) });
                }

                let mTransport = Alloter.allot(ALLOT_MINERAL_TRANSPORT, room.name);
                if (mTransport) {
                    this.spawnInfo = undefined;
                    let bodies = this.getBodies(['c2', 'm1'], capEnergy);
                    let id = CreepManager.getId('transporter');
                    this.setInfo(bodies, 'transporter_' + id,
                        { memory: this.getMemory('transporter', id, room.name, { allotUnit: mTransport }) });
                }
            }
        }

        //upgrader
        let numUpgraders = 1;
        let storage = room.storage;
        if (!storage) numUpgraders = 0;
        else if (controller.level != 8) {
            if (storage.store.energy >= 300000) numUpgraders += 1;
            if (storage.store.energy >= 350000) numUpgraders += 1;
            if (storage.store.energy >= 400000) numUpgraders += 1;
            if (storage.store.energy >= 450000) numUpgraders += 1;
            if (storage.store.energy >= 500000) numUpgraders += 2;
            if (storage.store.energy >= 550000) numUpgraders += 3;
        }
        if (storage && storage.store.energy < 50000) numUpgraders = 0;
        // if(controller.level == 8 && storage) if(storage.store.energy > 600000) numUpgraders = 1; else numUpgraders = 0;
        if (controller.level == 8 && controller.ticksToDowngrade > 110000) numUpgraders = 0;
        // if (controller.level == 8 && controller.ticksToDowngrade < 110000) numUpgraders = 1;
        if (wishCreepRole == 'upgrader' || creeps['upgrader'] < numUpgraders) {
            this.spawnInfo = undefined;
            let budget = capEnergy;
            if (controller.level == 8) budget = Math.min(3000, budget);
            let bodies = this.getBodies([controller.level >= 6 && controller.level != 8 ? 'w2' : 'w1', 'c1', 'm1'], budget);
            // if(controller.level == 8) bodies = [WORK, CARRY, MOVE];
            let id = this.getId('upgrader');
            this.setInfo(bodies, 'upgrader_' + id, { memory: this.getMemory('upgrader', id, room.name) });
        }

        //worker
        if (!global.rooms[room.name]) global.rooms[room.name] = { workerNum: 0 };
        let bodies: BodyPartConstant[] | undefined = undefined;
        let numWorkers = global.rooms[room.name].workerNum;
        numWorkers = numWorkers == undefined ? 0 : numWorkers;
        if ((Game.time & 5) == 0 || global.rooms[room.name].workerNum == undefined) {
            bodies = this.getBodies(controller.level < 3 ? ['w1', 'c1', 'm2'] : ['w1', 'c1', 'm1'], capEnergy);
            const MAX_WORKERS = controller.level > 4 ? 5 : Alloter.getUnitCount(ALLOT_HARVEST, room.name) * 5;
            // let repairList = room.structures.filter(structure => structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL
            //      && structure.hits < structure.hitsMax * 0.1)
            let buildSites = room.find(FIND_CONSTRUCTION_SITES);
            if (Memory.colonies[room.name])
                for (const r of Memory.colonies[room.name])
                    if (Game.rooms[r.name]) buildSites.push(...Game.rooms[r.name].find(FIND_CONSTRUCTION_SITES));
            const buildTicks = _.sum(buildSites,
                site => Math.max(site.progressTotal - site.progress, 0)) / BUILD_POWER;
            // const repairTicks = _.sum(repairList,
            //     structure => structure.hitsMax - structure.hits) / REPAIR_POWER;
            numWorkers = Math.ceil(2 * (5 * buildTicks) /
                (bodies.length / 3 * CREEP_LIFE_TIME));
            numWorkers = Math.min(numWorkers, MAX_WORKERS);
            if (controller.level < 4) numWorkers = Math.max(numWorkers, MAX_WORKERS);
            global.rooms[room.name].workerNum = numWorkers;
        }

        if (wishCreepRole == 'worker' || creeps['worker'] < numWorkers) {
            this.spawnInfo = undefined;
            if (!bodies) bodies = this.getBodies(controller.level < 3 ? ['w1', 'c1', 'm2'] : ['w1', 'c1', 'm1'], capEnergy);
            let id = this.getId('worker');
            this.setInfo(bodies, 'worker_' + id, { memory: this.getMemory('worker', id, room.name) });
        }

        // wish repairer
        if (wishCreepRole == 'repairer') {
            this.spawnInfo = undefined;
            let id = this.getId('repairer');
            let bodies = this.getBodies(wishCreep.ratio ? wishCreep.ratio : ['w4', 'c1', 'm2'], capEnergy);
            this.setInfo(bodies, 'repairer_' + id,
                { memory: this.getMemory('repairer', id, room.name) });
        }

        // wish rCarrier
        if (wishCreepRole == 'rCarrier') {
            this.spawnInfo = undefined;
            let id = this.getId('rCarrier');
            let bodies = this.getBodies(wishCreep.ratio ? wishCreep.ratio : ['c1', 'm1'], capEnergy);
            this.setInfo(bodies, 'rCarrier_' + id,
                { memory: this.getMemory('rCarrier', id, room.name) });
        }

        // wish coreDis
        if (wishCreepRole == 'coreDis') {
            this.spawnInfo = undefined;
            let id = this.getId('coreDis');
            let bodies = this.getBodies(['a1', 'm1'], capEnergy);
            this.setInfo(bodies, 'coreDis_' + id,
                { memory: this.getMemory('coreDis', id, room.name) });
        }

        // wish transporter
        if (wishCreepRole == 'transporter') {
            this.spawnInfo = undefined;
            let bodies = this.getBodies(['c2', 'm1'], capEnergy);
            let id = CreepManager.getId('transporter');
            this.setInfo(bodies, 'transporter_' + id,
                { memory: this.getMemory('transporter', id, room.name) });
        }

        // wish warrior
        if (wishCreepRole == 'warrior') {
            this.spawnInfo = undefined;
            let bodies = this.getBodies(['t1', 'r3', 'm1'], capEnergy);
            let id = CreepManager.getId('warrior');
            this.setInfo(bodies, '_warrior_' + id + Game.time.toString(36),
                { memory: this.getMemory('warrior', id, room.name) });
        }

        // wish destroyer
        if (wishCreepRole == 'destroyer') {
            this.spawnInfo = undefined;
            let bodies = this.getBodies(['t1', 'w3', 'm1'], capEnergy);
            let id = CreepManager.getId('destroyer');
            this.setInfo(bodies, '_destroyer_' + id + Game.time.toString(36),
                { memory: this.getMemory('destroyer', id, room.name) });
        }

        // wish healer
        if (wishCreepRole == 'healer') {
            this.spawnInfo = undefined;
            let bodies = this.getBodies(['t13', 'h27', 'm10'], capEnergy);
            let id = CreepManager.getId('healer');
            this.setInfo(bodies, '_healer_' + id + Game.time.toString(36),
                { memory: this.getMemory('healer', id, room.name) });
        }

        // wish shWarrior
        if (wishCreepRole == 'shWarrior' && wishCreep.ratio) {
            this.spawnInfo = undefined;
            let bodies = this.getBodies(wishCreep.ratio, capEnergy);
            let id = CreepManager.getId('shWarrior');
            this.setInfo(bodies, 'shWarrior_' + id,
                { memory: this.getMemory('shWarrior', id, room.name) });
        }

        // wish shWarrior2
        if (wishCreepRole == 'shWarrior2' && wishCreep.ratio) {
            this.spawnInfo = undefined;
            let bodies = this.getBodies(wishCreep.ratio, capEnergy);
            let id = CreepManager.getId('shWarrior2');
            this.setInfo(bodies, 'shWarrior2_' + id,
                { memory: this.getMemory('shWarrior2', id, room.name) });
        }

        // wish shHealer
        if (wishCreepRole == 'shHealer' && wishCreep.ratio) {
            this.spawnInfo = undefined;
            let bodies = this.getBodies(wishCreep.ratio, capEnergy);
            let id = CreepManager.getId('shHealer');
            this.setInfo(bodies, 'shHealer_' + id,
                { memory: this.getMemory('shHealer', id, room.name) });
        }

        // transporter
        let transport = SourceManager.allotTransporter(room);
        if (transport && controller.level > 1 && room.memory.storage && produceH) {
            this.spawnInfo = undefined;
            if (wishCreepRole == 'transporter') CreepWish.clear(room.name);
            let cost = capEnergy;
            if (controller.level < 8 && Memory.stableData[transport.roomName]) {
                // if(!transport.data.distance && transport.data.pos)
                //     transport.data.distance = PathFinder.search(room.spawns[0].pos, transport.data.pos, {swampCost: 1}).cost + 5;
                // if(!transport.data.distance) return;
                let capacity = (Memory.stableData[transport.roomName].harvesterPath[transport.id].dis + 2) * 20 * 1.1;
                let multiple = Math.ceil(capacity / 100);
                cost = multiple * 150// + (transport.roomName == room.name ? 0 : 100);
                cost = Math.min(cost, capEnergy) - (transport.roomName == room.name ? 0 : 0);
            }
            let bodies = this.getBodies(controller.level < 4 ? ['c1', 'm1'] : ['c2', 'm1'], cost);
            // if(transport.roomName != room.name) bodies[0] = WORK;
            let id = CreepManager.getId('transporter');
            this.setInfo(bodies, 'transporter_' + id,
                { memory: this.getMemory('transporter', id, room.name, { allotUnit: transport }) });
            Alloter.free(transport);
        }

        // stableTransporter
        // if(Memory.rooms[room.name].centerLink && creeps['stableTransporter'].length < 0){
        //     this.spawnInfo = undefined;
        //     let id = CreepManager.getId('stableTransporter');
        //     let bodies = this.getBodies(['c2', 'm1'], 1200);
        //     this.setInfo(bodies, 'stableTransporter_' + id,
        //     { memory: this.getMemory('stableTransporter', id, room.name) });
        // }

        // manager
        if (wishCreepRole == 'manager' || controller.level > 2 && creeps['manager'] < 1) {
            this.spawnInfo = undefined;
            let id = this.getId('manager');
            let bodies = this.getBodies(['c2', 'm1'], Math.min(capEnergy, 2250));
            this.setInfo(bodies, 'manager_' + id,
                { memory: this.getMemory('manager', id, room.name) });
        }

        // harvester
        let source = SourceManager.allotSource(room);
        if (source && produceH) {
            // console.log('hello', room.name, Game.time);
            this.spawnInfo = undefined;
            let id = CreepManager.getId('harvester');
            let newName = 'harvester_' + id;
            let bodies: BodyPartConstant[] = [];
            if (controller.level == 8 && source.data.pos.roomName == room.name) bodies = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE,
                CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
            else if (capEnergy >= 1050) bodies = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
            else if (capEnergy >= 650) bodies = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE];
            else if (capEnergy >= 550) bodies = [WORK, WORK, WORK, WORK, WORK, MOVE];
            else if (capEnergy >= 300) bodies = [WORK, WORK, MOVE];
            if (controller.level == 8 && source.data.pos.roomName != room.name) bodies = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY]
            this.setInfo(bodies, newName,
                { memory: this.getMemory('harvester', id, room.name, { allotUnit: source }) });
            Alloter.free(source);
        }

        // wish defencer
        if (wishCreepRole == 'defencer') {
            this.spawnInfo = undefined;
            let id = this.getId('defencer');
            let bodies = this.getBodies(['t1', 'r2', 'm4', 'h1'], Math.min(capEnergy, 1520)); // * 2
            this.setInfo(bodies, 'defencer_' + id,
                { memory: this.getMemory('defencer', id, room.name) });
        }

        // wish melee
        if (wishCreepRole == 'melee') {
            this.spawnInfo = undefined;
            let id = this.getId('melee');
            let bodies = this.getBodies(wishCreep.ratio ? wishCreep.ratio : ['a1', 'm1'], capEnergy);
            this.setInfo(bodies, 'melee_' + id,
                { memory: this.getMemory('melee', id, room.name) });
        }

        let filler = Alloter.allot(ALLOT_FILLER, room.name);
        if (filler) {
            this.spawnInfo = undefined;
            let budget = Math.min(300 + (capEnergy - 300) / 2, 1650);
            let id = CreepManager.getId('filler');
            this.setInfo(this.getBodies(controller.level < 3 ? ['c1', 'm1'] : ['c2', 'm1'], budget), 'filler_' + id,
                { memory: this.getMemory('filler', id, room.name, { allotUnit: filler }) });
            Alloter.free(filler);
        }

        if (this.spawnInfo) {
            this.spawn(room, this.spawnInfo.bodies, this.spawnInfo.name, this.spawnInfo.opts, this.spawnInfo.spawn);
            this.spawnInfo = undefined;
        }

        CreepWish.clear(room.name);

        let hcount = Alloter.getUnitCount(ALLOT_HARVEST, room.name);
        if (Memory.colonies[room.name])
            for (const r of Memory.colonies[room.name])
                if (r.enable)
                    hcount += Alloter.getUnitCount(ALLOT_HARVEST, r.name);
        let tcount = Alloter.getUnitCount(ALLOT_TRANSPORT, room.name);
        if (Memory.colonies[room.name])
            for (const r of Memory.colonies[room.name])
                if (r.enable)
                    tcount += Alloter.getUnitCount(ALLOT_TRANSPORT, r.name);
        let visual: string[][] = [];
        visual.push(['filler', this.getVisualString(creeps['filler'], fillerCount[controller.level])]);
        visual.push(['harvester', this.getVisualString(creeps['harvester'], hcount)]);
        visual.push(['transporter', this.getVisualString(creeps['transporter'], tcount)]);
        visual.push(['worker', this.getVisualString(creeps['worker'], numWorkers)]);
        visual.push(['upgrader', this.getVisualString(creeps['upgrader'], numUpgraders)]);
        if (controller.level > 2) visual.push(['manager', this.getVisualString(creeps['manager'], 1)]);
        // if(room.terminal) visual.push(['trader', this.getVisualString(creeps['trader'].length, 1)]);
        // if(Memory.rooms[room.name].centerLink) visual.push(['stableTransporter', this.getVisualString(creeps['stableTransporter'], 1)]);
        if (Memory.gotoDismantle && Memory.dismantlerRoom == room.name) visual.push(['dismantler', this.getVisualString(creeps['dismantler'], 2)]);
        if (Memory.gotoHaul && Memory.haulerRoom == room.name) visual.push(['hauler', this.getVisualString(creeps['hauler'], 3)]);
        if (Memory.expandRoom == room.name) visual.push(['pioneer', this.getVisualString(creeps['pioneer'], 2)]);
        Visualizer.infoBox('creeps', visual, { x: 1, y: 1, roomName: room.name }, 7.5);
    }

    static getVisualString(count: number, maxCount: number): string {
        return maxCount >= 10 ? count + '/' + maxCount : '  ' + count + '/' + maxCount;
    }

    static getMemory(role: string, id: number, spawnRoom: string, other?: any) {
        let result = {
            role: role,
            id: id,
            spawnRoom: spawnRoom,
        }
        for (const key in other) {
            result[key] = other[key];
        }
        let wish = CreepWish.getWish(spawnRoom);
        if (wish && role == wish.role) {
            if (wish.memory) {
                for (const key in wish.memory) {
                    result[key] = wish.memory[key];
                }
            }
        }
        return result;
    }

    static setInfo(parts: BodyPartConstant[], name: string, opts: any, spawn?: StructureSpawn, dir?: DirectionConstant) {
        this.spawnInfo = { name: name, bodies: parts, opts: opts, spawn: spawn }
        this.spawnInfo.opts.dir = dir;
    }

    static spawn(room: Room, parts: BodyPartConstant[], name: string, opts: SpawnOptions, spawn?: StructureSpawn) {
        if (!this.consumeOrder) this.consumeOrder = {};
        if (!this.consumeOrder[room.name]) this.consumeOrder[room.name] = new RoomPlanner(room.name).getConsumeOrdr();
        opts.energyStructures = this.consumeOrder[room.name] as any;

        if (!opts.memory) return;
        let spawns = room.spawns.filter(spawn => !spawn.spawning);
        if (!spawns.length) {
            let energyNeeded = _.sum(parts, part => BODYPART_COST[part]);
            if (energyNeeded < room.energyAvailable) return;
            let process = Process.getProcess(room.name, 'filling') as ProcessFilling;
            if (process) process.refillNeeded(true);
            return;
        }
        for (const spawn of spawns) {
            // console.log(spawn.spawnCreep(parts, name, {dryRun: true}) + name + spawn.name);
            let code = spawn.spawnCreep(parts, name, { dryRun: true });
            if (code == ERR_NOT_ENOUGH_ENERGY) {
                let proccess = Process.getProcess(room.name, 'filling') as ProcessFilling;
                if (proccess) {
                    proccess.refillNeeded(false);
                }
                return;
            }
            if (code == OK) {
                // console.log(spawn.name + name);
                if (opts.memory.role)
                    console.log('Spawning new ' + opts.memory.role + ': ' + name);
                else console.log('Spawning: ' + name);
                if (spawn.spawnCreep(parts, name, opts) != OK) {
                    console.log(`<span style='color:red'>can't spawn creep! bodies: ${parts} name: ${name}</span>`);
                    delete this.consumeOrder[room.name];
                }
                else {
                    let wish = CreepWish.getWish(room.name);
                    if (wish && opts.memory.role == wish.role && wish.processId) {
                        let process = Process.getProcess(wish.processId);
                        if (process) process.registerCreep(name);
                    }
                    switch (opts.memory.role) {
                        case 'filler':
                            let process = Process.getProcess(opts.memory.spawnRoom, 'filling');
                            if (process) process.registerCreep(name);
                            break;
                        default:
                            break;
                    }
                }
                return;
            }
        }
    }

    static getId(role: string) {
        let creeps = _.filter(Game.creeps, creep => creep.memory.role == role);
        for (let i = 0; i < 999; i++) {
            let find = false;
            for (const creep of creeps) {
                if (creep.memory.id == i) { find = true; break; }
            }
            if (!find) return i;
        }
        throw 'cannot get role id!';
    }

    static getIdInRoom(role: string, roomName: string) {
        let creeps = _.filter(Game.creeps, creep => creep.memory.role == role && creep.memory.spawnRoom == roomName);
        for (let i = 0; i < 999; i++) {
            let find = false;
            for (const creep of creeps) {
                if (creep.memory.id == i) { find = true; break; }
            }
            if (!find) return i;
        }
        throw 'cannot get role id in room!';
    }

    static getBodies(radio: string[], useEnergy: number): BodyPartConstant[] {
        let cost = 0;
        let count = 0;
        for (const body of radio) {
            let a = this.getBodyByHeadLetter(body[0]);
            cost += BODYPART_COST[a] * Number.parseInt(body.substr(1));
            count += Number.parseInt(body.substr(1));
        }
        let multiple = Math.floor(useEnergy / cost);
        if (multiple * count > 50) multiple = Math.floor(50 / count);
        let result: BodyPartConstant[] = [];
        for (const body of radio) {
            let num = Number.parseInt(body.substr(1)) * multiple;
            let a = this.getBodyByHeadLetter(body[0]);
            for (let i = 0; i < num; i++) {
                result.push(a);
            }
        }
        return result;
    }

    static prodictBodies(roomName: string, radio: string[]): BodyPartConstant[] {
        let room = Game.rooms[roomName];
        if (!room) return [];
        return this.getBodies(radio, room.energyCapacityAvailable);
    }

    static getCost(radio: string[], multiple: number): number {
        let cost: number = 0;
        for (const body of radio) {
            let a = this.getBodyByHeadLetter(body[0]);
            cost += BODYPART_COST[a] * Number.parseInt(body[1]);
        }
        return cost * multiple;
    }

    static getBodyByHeadLetter(s: string): BodyPartConstant {
        switch (s) {
            case 'm':
                return MOVE
            case 'w':
                return WORK
            case 'c':
                return CARRY
            case 'a':
                return ATTACK
            case 'r':
                return RANGED_ATTACK
            case 't':
                return TOUGH
            case 'h':
                return HEAL
            case 'C':
                return CLAIM
        }
        throw new Error("Unknown Body Head Letter!");
    }
}
