import './prototypes/ConstructionSite'
import './prototypes/RoomPosition';
import './prototypes/RoomVisual';
import './prototypes/RoomPropertiesForAllStructureTypes';
import './prototypes/Structures';
import './prototypes/Room';
import './prototypes/Creep';
import './prototypes/prototype.Whitelist';
import stats from './profiler/stats';
import actionsCounter from './profiler/actionCounter';
// import labCtrl from './extensions/labCtrl';
import { towerEstimate } from './lib/towerEstimate';

import { CreepManager } from "./programs/creepManager";
import { SourceManager } from "./programs/sourceManager";
import { RoleFactory } from "./roles/roleFactory";
import { Tower } from "./extensions/tower";
import { ErrorMapper, reset } from "./utils/ErrorMapper";

import "./programs/Traveler";
import { Alloter } from "./logistics/alloter";
import { Command } from './programs/command';
import { lowEnergyLine, USE_ACTION_COUNTER, USER_NAME } from './config';
import { profile } from './profiler/decorator';
import { Market } from './extensions/market';
import { Statistics } from './programs/statistics';
import { RoomPlanner } from './roomPlanner/RoomPlanner';
import { Process } from './process/process';
import { Processes } from './process/processes';
import { Intel, intel } from './programs/Intel';
import { RolePC } from './roles/powerCreep';
import { Industry } from './programs/industry';
import { RoadPlanner } from './roomPlanner/RoadPlanner';
import { Visualizer } from './programs/Visualizer';
import { refreshRoomPosition } from './utils';
import { BarrierPlanner } from './roomPlanner/barrierPlanner';
import { ProcessActiveDefend } from './process/instances/activeDefend';
import { Traveler } from './programs/Traveler';
import { ProcessAttack } from './process/instances/attack';
import { repeater } from './logistics/Repeater';
import { RolePioneer } from './roles/pioneer';
import { RoleHauler } from './roles/hauler';
import { sandBox } from './sandBox';

export const loop = ErrorMapper.wrapLoop(() => {
    // if(Game.cpu.limit == 0) {
    //     _.forEach(Game.creeps, creep => creep.suicide());
    //     return;
    // }
    stats.reset();
    let same = tryInitSameMemory();
    if (USE_ACTION_COUNTER) actionsCounter.init(true);

    // let creep = Game.creeps.sad;
    // if(creep) {
    //     // if(new RoleHauler(creep).isBoosted() && creep.store.energy && creep.room.name != 'W9S23')
    //         new RolePioneer(creep).run();
    //     // else new RoleHauler(creep).run();
    // }
    // if(Game.shard.name == 'shard2') {
    //     tinyMain(false);
    //     return;
    // }

    // if(Game.shard.name == 'shard3') {
    //     for (const name in Game.creeps) {
    //         // const creep = Game.creeps[name];
    //         if(name[0] == '_' && Game.creeps[name].pos.roomCoords.y > 10) {
    //             if(!Memory.creeps[name]) Memory.creeps[name] = {role: name.split('_')[1], healerName: []} as any;
    //             let process = Process.getProcess('W12N9', 'attack') as ProcessAttack;
    //             if(process && process.creeps.findIndex(c => c == name) == -1) {
    //                 process.registerCreep(name);
    //                 process.boostFlag[name] = 'boosted';
    //                 process.memory.boostFlag[name] = 'boosted';
    //             }
    //         }
    //     }
    // }

    // let path = [
    //     {shard: 'shard3', roomName: 'W10N10', x: 18, y: 8},
    //     {shard: 'shard2', roomName: 'W10N10', x: 9, y: 40},
    //     {shard: 'shard1', roomName: 'W10N10', x: 22, y: 26},
    //     {shard: 'shard0', roomName: 'W20N11', x: 15, y: 48},
    //     {shard: 'shard0', roomName: 'W31N10', x: 48, y: 47},
    //     {shard: 'shard0', roomName: 'W29S0', x: 1, y: 38},
    //     {shard: 'shard0', roomName: 'W30S29', x: 46, y: 47},
    //     {shard: 'shard0', roomName: 'W20S30', x: 37, y: 30},
    //     {shard: 'shard1', roomName: 'W10S20', x: 37, y: 32},
    //     {shard: 'shard2', roomName: 'W10S20', x: 33, y: 38}
    // ]
    // let des = {shard: 'shard3', roomName: 'W10S20'};
    // for (const name in Game.creeps) {
    //     const creep = Game.creeps[name];
    //     if(name[0] == '_' && !(creep.memory as any).arrived && !!creep.body[0].boost) {
    //         console.log(name, creep.pos)
    //         let code = Traveler.interShardTravel(creep, path, des);
    //         if(code == true) {
    //             (creep.memory as any).arrived = 1;
    //         }
    //     }
    // }

    // if(Game.creeps.a) {
    //     const creep = Game.creeps.a;
    //     const target = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_INVADER_CORE})[0];
    //     if(target) creep.attack(target);
    //     // creep.travelTo(new RoomPosition(5,29,'W46S3'));

    // }

    if (reset) globalReset();
    let t1 = Game.cpu.getUsed();
    CreepManager.clearUnexistingCreep();//if(1)return
    let t2 = Game.cpu.getUsed();
    rebuildMemory(same && !reset);
    let t3 = Game.cpu.getUsed();
    // try {// 并不信任外来js
    //     // 看你自己要啥，房号填好了
    //     // labCtrl.run('E17N31', RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE, 5e4);
    // } catch (error) {
    //     if(!error.stack)
    //         throw error;
    //     console.log(`<span style='color:red'>${_.escape(ErrorMapper.sourceMappedStackTrace(error))}</span>`);
    // }
    Command.run();
    Alloter.setDirty();
    Statistics.recordCreditChange();
    let t4 = Game.cpu.getUsed();
    Intel.run();
    let t5 = Game.cpu.getUsed();
    let d1 = 0, d2 = 0, d3 = 0;
    for (const roomName in Game.rooms) {
        if (!Game.rooms.hasOwnProperty(roomName)) continue;
        // console.log(k);
        const room = Game.rooms[roomName];
        if (room.memory) room.memory.isClaimed = false;
        let controller = room.controller;
        if (!controller) continue;
        if (!controller.my) continue;
        if (room.memory) room.memory.isClaimed = true;
        if (Memory.rooms[roomName].underAttacking && controller.level < 4 && !controller.safeMode && controller.safeModeAvailable) controller.activateSafeMode();

        if (!Memory.colonies[roomName]) Memory.colonies[roomName] = [];
        if (!room.memory) {
            SourceManager.analyzeRoom(room.name);
        }

        if (!Command.checkRoomEnvirounment(room)) {
            console.log(`<span style='color:red'>need a 'base' flag in the colony!</span>`);
            return;
        }
        // console.log(JSON.stringify( room.structures[0]));

        let t6 = Game.cpu.getUsed();
        SourceManager.refreshRoom(room);
        d1 += Game.cpu.getUsed() - t6;
        var storage = Game.getObjectById<StructureStorage>(room.memory.storage);
        if (storage)
            room.memory.storedEnergy = storage.store.energy;
        if (room.memory.storedEnergy < lowEnergyLine || Memory.UnderAttacking)
            room.memory.lowEnergy = true;
        else room.memory.lowEnergy = false;
        let t7 = Game.cpu.getUsed();
        CreepManager.run(room);
        let t8 = Game.cpu.getUsed();
        d2 += t8 - t7;
        Tower.run(room);
        d3 += Game.cpu.getUsed() - t8;

        if (!Process.getProcess(roomName, 'filling')) Processes.processFilling(roomName);
        // if(!Process.getProcess(roomName, 'mining')) Process.processes
        // if(reset) new RoomPlanner(roomName).coverRampart();
        if (Game.time % 100 == 0) {
            // let t = Game.cpu.getUsed();
            new RoomPlanner(roomName).buildMissingBuildings();
            if (room.ramparts.find(rampart => rampart.hits < rampart.targetHits) && !Process.getProcess(roomName, 'repair')) Processes.processRepair(roomName, 'normal');
            // let tt = Game.cpu.getUsed();
            // console.log('roomPlanner',roomName , (tt - t).toFixed(3));
        }
    }
    let t9 = Game.cpu.getUsed();
    Market.run();
    let t10 = Game.cpu.getUsed();
    Process.runAllProcesses();
    let t11 = Game.cpu.getUsed();
    Industry.run();
    let t12 = Game.cpu.getUsed();
    Processes.minePower();
    Processes.mineDeposit();

    let te = Game.cpu.getUsed();
    // console.log(`total: ${(te - t1).toFixed(3)} rebuild: ${(t3 - t2).toFixed(3)} refresh: ${d1.toFixed(3)} creepManager: ${d2.toFixed(3)} tower: ${d3.toFixed(3)} market: ${(t10 - t9).toFixed(3)} process: ${(t11 - t10).toFixed(3)} intel: ${(t5 - t4).toFixed(3)} industry: ${(t12 - t11).toFixed(3)} command: ${(t4 - t3).toFixed(3)}`);
    // let s: { [roleName: string]: any} = {};
    // s['harvester'] = { cpu: 0, num: 0};
    // s['transporter'] = { cpu: 0, num: 0};
    // s['upgrader'] = { cpu: 0, num: 0};
    // s['manager'] = { cpu: 0, num: 0};
    // s['reservist'] = { cpu: 0, num: 0};

    for (const name in Game.creeps) {
        // let t = Game.cpu.getUsed();
        const creep = Game.creeps[name];
        var role = creep.memory.role;
        let run = false;
        if (role == 'harvester' || role == 'upgrader' || role == 'hauler' || role == 'dismantler' || role == 'worker' || role == 'reservist' || role == 'manager'
            || role == 'miner' || role == 'pioneer') run = true;
        if (role == 'transporter' && !creep.memory.target) run = true;
        if (!run) continue;
        // if(creep.memory.role == 'powerAttack' || creep.memory.role == 'powerHealer' || creep.memory.role == 'filler' || creep.memory.role == 'powerRange'
        //     || creep.memory.role == 'dHarvester' || creep.memory.role == 'dTransporter' || creep.memory.role == 'container' || creep.memory.role == 'defencer'
        //     || creep.memory.role == 'repairer' || creep.memory.role == 'rCarrier' || creep.memory.role == 'melee' || creep.memory.role == 'healer'
        //     || creep.memory.role == 'warrior' || creep.memory.role == 'destroyer') continue;
        // if(creep.memory.role == 'transporter' && creep.memory.target) continue;
        try {
            // if(!s[creep.memory.role]) s[creep.memory.role] = { cpu: 0, num: 0};
            var creepRole = RoleFactory.getRole(creep);
            // if(role && creep.room.memory.underAttacking){
            //     if(!creep.room.controller) {creep.suicide(); continue; }
            //     if(!creep.room.controller.my) {creep.suicide(); continue; }
            //     if(!creep.room.towers.length){
            //         let enemies = creep.room.find(FIND_HOSTILE_CREEPS);
            //         if(enemies.length){
            //             let longest = 0;
            //             for (const enemy of enemies) {
            //                 if(enemy.ticksToLive && enemy.ticksToLive > longest) longest = enemy.ticksToLive;
            //             }
            //             Memory.rooms[creep.pos.roomName].underAttacking = true;
            //             Memory.rooms[creep.pos.roomName].timeLeft = longest;
            //             creep.suicide();
            //             continue;
            //         }
            //         else creep.room.memory.underAttacking = false;
            //     }
            // }
            if (creepRole) creepRole.run();
        } catch (error) {
            if (!error.stack)
                throw error;
            console.log(`<span style='color:red'>${_.escape(ErrorMapper.sourceMappedStackTrace(error))}</span>`);
        }
        // s[creep.memory.role].cpu += Game.cpu.getUsed() - t;
        // s[creep.memory.role].num += 1;
    }
    for (const name in Game.powerCreeps) {
        const pc = Game.powerCreeps[name];
        if (pc.ticksToLive) {
            RolePC.getRole(pc).run();
        }
        // else{
        //     switch (pc.name) {
        //         case 'PC_ONE':
        //             pc.spawn(Game.rooms.E49N22.powerSpawn as any);
        //             break;
        //         case 'PC_TWO':
        //             pc.spawn(Game.rooms.E51N21.powerSpawn as any);
        //             break;
        //         case 'PC_THREE':
        //             pc.spawn(Game.rooms.E47N22.powerSpawn as any);
        //             break;
        //         case 'PC_FOUR':
        //             pc.spawn(Game.rooms.E44N19.powerSpawn as any);
        //             break;
        //         case 'PC_FIVE':
        //             pc.spawn(Game.rooms.E49N19.powerSpawn as any);
        //             break
        //         default:
        //             break;
        //     }
        // }
    }
    // for (const role in s) {
    //     if (s.hasOwnProperty(role)) {
    //         const element = s[role];
    //         s[role].cpu = Number.parseFloat((element.cpu).toFixed(3));
    //         s[role].avg = Number.parseFloat((element.cpu / element.num).toFixed(3));
    //     }
    // }

    // console.log('total:', (Game.cpu.getUsed() - te).toFixed(3), JSON.stringify(s));

    // let t3 = Game.cpu.getUsed();
    // console.log('t2 to t3: ', t3 - t2);
    Alloter.checkDirty();
    repeater.repeatActions();
    Processes.showHud();
    // for (const k in Game.rooms) {
    //     if (!Game.rooms.hasOwnProperty(k)) continue;
    //     // console.log(k);
    //     const room = Game.rooms[k];
    //     if(!room.controller) continue;
    //     if(!room.controller.my) continue;

    //     // Statistics.run(room);
    //     // Visualizer.infoBox('cost', [['E49N22', Memory.statistics['E49N22'].averageParseCost.toFixed(3)],
    //     //     ['E51N21', Memory.statistics['E51N21'].averageParseCost.toFixed(3)]], {x: 1, y:7, roomName: k}, 10);
    // }
    // Processes.showHud();

    // if(USE_ACTION_COUNTER) console.log(actionsCounter.output());
    if (Game.time % 3 == 1) stats.commit();
    if (USE_ACTION_COUNTER) actionsCounter.save(1500);
    // if(USE_ACTION_COUNTER)
    //     console.log('end', (Game.cpu as any)._getUsed().toFixed(3), 'excute percentage',
    //         (1 - actionsCounter.getData().totalCPU / (Game.cpu as any)._getUsed()).toFixed(3));

    Game.industry = { getAllRaw: Industry.getAllRaw, produce: (a1, a2, a3) => Industry.produce(a1, a2, a3), calIndustryProfit: (log) => Industry.calIndustryProfit(log), neededAmount: (a1, a2) => Industry.neededAmount(a1, a2) };
    global['GC'] = GC;
    (Game as any).reset = () => Processes.rebuildProcesses();
    (Game as any).printProcesses = () => console.log(JSON.stringify(Process.processes, undefined, 4));
    (Game as any).printProcessesType = () => console.log(JSON.stringify(Process.process_Type, undefined, 4));
    (Game as any).printProcessesId = () => console.log(JSON.stringify(Process.processes_ID, undefined, 4));
    (global as any).displayTower = (mainRoomName, observeRoomName) => towerEstimate.run(mainRoomName, observeRoomName)
    // if(ProcessActiveDefend.costMatrixs['E5S1']) Visualizer.displayCostMatrix(ProcessActiveDefend.costMatrixs['E5S1'], 'E5S1', false)
    // let matrix = ProcessAttack.getHitsMatrix('E5S1');
    // if(matrix) Visualizer.displayCostMatrix(matrix);

    // if(Game.cpu.bucket < 10) while(true){}
});

function tinyMain(recordStat: boolean = true) {
    if (recordStat) stats.reset();
    let same = tryInitSameMemory();
    if (USE_ACTION_COUNTER) actionsCounter.init(true);

    if (reset) globalReset();
    CreepManager.clearUnexistingCreep();//if(1)return
    rebuildMemory(same && !reset);

    // for (const name in Game.creeps) {
    //     // const creep = Game.creeps[name];
    //     if(name[0] == '_') {
    //         if(!Memory.creeps[name]) Memory.creeps[name] = {role: name.split('_')[1], healerName: []} as any;
    //         let process = Process.getProcess('E53N21', 'attack', 'targetRoom', 'E55N21') as ProcessAttack;
    //         if(process && process.creeps.findIndex(c => c == name) == -1) {
    //             process.registerCreep(name);
    //             process.boostFlag[name] = 'boosted';
    //             process.memory.boostFlag[name] = 'boosted';
    //         }
    //     }
    // }

    // Command.run();
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        let controller = room.controller;
        if (!controller) continue;
        if (!controller.my) continue;
        if (room.memory) room.memory.isClaimed = true;
        Tower.run(room);
    }
    // Process.runAllProcesses();

    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        if (creep.memory.role == 'powerAttack' || creep.memory.role == 'powerHealer' || creep.memory.role == 'filler' || creep.memory.role == 'powerRange'
            || creep.memory.role == 'dHarvester' || creep.memory.role == 'dTransporter' || creep.memory.role == 'container' || creep.memory.role == 'defencer'
            || creep.memory.role == 'repairer' || creep.memory.role == 'rCarrier' || creep.memory.role == 'melee' || creep.memory.role == 'healer'
            || creep.memory.role == 'warrior' || creep.memory.role == 'destroyer') continue;
        try {
            var role = RoleFactory.getRole(creep);
            if (role) role.run();
        } catch (error) {
            if (!error.stack)
                throw error;
            console.log(`<span style='color:red'>${_.escape(ErrorMapper.sourceMappedStackTrace(error))}</span>`);
        }
    }

    repeater.repeatActions();
    if (recordStat && Game.time % 3 == 1) stats.commit();
    if (USE_ACTION_COUNTER) actionsCounter.save(1500);

    Game.industry = { getAllRaw: Industry.getAllRaw, produce: (a1, a2, a3) => Industry.produce(a1, a2, a3), calIndustryProfit: (log) => Industry.calIndustryProfit(log), neededAmount: (a1, a2) => Industry.neededAmount(a1, a2) };
    global['GC'] = GC;
    (Game as any).reset = () => Processes.rebuildProcesses();
    (Game as any).printProcesses = () => console.log(JSON.stringify(Process.processes, undefined, 4));
    (Game as any).printProcessesType = () => console.log(JSON.stringify(Process.process_Type, undefined, 4));
    (Game as any).printProcessesId = () => console.log(JSON.stringify(Process.processes_ID, undefined, 4));
    (global as any).displayTower = (mainRoomName, observeRoomName) => towerEstimate.run(mainRoomName, observeRoomName);

    try {
        sandBox();
    } catch (error) {
        console.log(`<span style='color:red'> Error in sandBox:\n${_.escape(ErrorMapper.sourceMappedStackTrace(error))}</span>`);
    }
}

function globalReset() {
    console.log('global reset');
    profile(rebuildMemory);
    Processes.rebuildProcesses();
    global.rooms = {};
    for (const roomName in Game.rooms) {
        if (Game.rooms.hasOwnProperty(roomName)) {
            const room = Game.rooms[roomName];
            global.rooms[roomName] = { workerNum: undefined };
        }
    }
    Market.changePrices();

    // for (const roomName in Memory.rooms) {
    //     if (Memory.rooms.hasOwnProperty(roomName)) {
    //         const room = Memory.rooms[roomName];
    //         if(!room.allot && !room.isClaimed) delete Memory.rooms[roomName];
    //     }
    // }
}

function rebuildMemory(same: boolean) {
    if (!Memory.rooms) Memory.rooms = {};
    if (!Memory.colonies) Memory.colonies = {};
    if (!Memory.market) Memory.market = {};
    if (!Memory.statistics) Memory.statistics = {};
    if (!Memory.stableData) Memory.stableData = {};
    for (const roomName in Memory.rooms) {
        const room = Memory.rooms[roomName];
        if (!room.mineral) room.mineral = {} as any;
        if (!Memory.market[roomName]) Memory.market[roomName] = {} as marketConfig;
    }

    // if(!same)
    // rebuildRoomPositions();
}

function rebuildRoomPositions() {
    // for (const roomName in Memory.rooms) {
    //     const room = Memory.rooms[roomName];
    //     for (const typeIndex in room.allot) {
    //         const type = room.allot[typeIndex];
    //         for (const unit of type) {
    //             if(unit && unit.data && unit.data.pos) unit.data.pos = refreshRoomPosition(unit.data.pos);
    //         }
    //     }
    // }
    // for (const roomName in Memory.stableData) {
    //     if (Memory.stableData.hasOwnProperty(roomName)) {
    //         const mem = Memory.stableData[roomName];
    //         if(mem.harvesterPosition){
    //             for (const key in mem.harvesterPosition) {
    //                 const pos = mem.harvesterPosition[key];
    //                 mem.harvesterPosition[key] = refreshRoomPosition(pos);
    //             }
    //         }
    //         if(mem.linkPosition){
    //             for (const key in mem.linkPosition) {
    //                 const pos = mem.linkPosition[key];
    //                 mem.linkPosition[key] = refreshRoomPosition(pos);
    //             }
    //         }
    //         if(mem.containerPosition){
    //             for (const key in mem.containerPosition) {
    //                 const pos = mem.containerPosition[key];
    //                 mem.containerPosition[key] = refreshRoomPosition(pos);
    //             }
    //         }
    //     }
    // }
    // for (const name in Memory.creeps) {
    //     let memory = Game.creeps[name].memory;
    //     if(memory.allotUnit && memory.allotUnit.data && memory.allotUnit.data.pos) memory.allotUnit.data.pos = refreshRoomPosition(memory.allotUnit.data.pos);
    // }
}

function GC() {
    global.lastMemoryTick = 0;

    delete Memory['roomFlags'];
    delete Memory['beingAttacking'];
    delete Memory['statistics'];
    delete Memory['lastChangeCredits'];
    delete Memory['lastTickCredits'];

    let collectedMarket = 0;
    for (const roomName in Memory.market) {
        if (Memory.market.hasOwnProperty(roomName)) {
            if (!Game.rooms[roomName]) {
                collectedMarket++;
                delete Memory.market[roomName];
            }
        }
    }

    let collectedRoom = 0;
    for (const roomName in Memory.rooms) {
        if (Memory.rooms.hasOwnProperty(roomName)) {
            const room = Memory.rooms[roomName];
            if (!Game.rooms[roomName]) {
                let isColony = false;
                for (const rn in Memory.colonies) {
                    for (const c of Memory.colonies[rn]) {
                        if (c.name == roomName) isColony = true;
                    }
                }
                if (!isColony) {
                    collectedRoom++;
                    delete Memory.rooms[roomName];
                } else {
                    delete room['isFilled'];
                }
                continue;
            }
            delete room['lowEnergyIdlePos'];
            delete room['fillerIdlePos'];
            delete room['isFilled'];
            delete room['stableTransporterPos'];
            delete room['traderPos'];
        }
    }
    return `GC: collected market ${collectedMarket} room ${collectedRoom}`;
}

function tryInitSameMemory(): boolean {
    if (global.lastMemoryTick && global.LastMemory && Game.time == (global.lastMemoryTick + 1)) {
        delete global.Memory;
        global.Memory = global.LastMemory;
        (RawMemory as any)._parsed = global.LastMemory;
        global.lastMemoryTick = Game.time;
        return true;
    } else {
        Memory.rooms;
        global.LastMemory = (RawMemory as any)._parsed;
        global.lastMemoryTick = Game.time;
        return false;
    }
}

/*
    if(Game.shard.name == 'shard3') {
        let PIONEER = Game.creeps['PIONEER'];
        if(PIONEER) {
            PIONEER.travelTo(new RoomPosition(13, 15, 'E50N20'))
        }
    }
    if(Game.shard.name == 'shard2') {
        let PIONEER = Game.creeps['PIONEER'];
        if(PIONEER) {
            if(Game.cpu.bucket <= 2) return;
            PIONEER.travelTo(new RoomPosition(26, 7, 'E55N21'));
            let c = Game.getObjectById<StructureController>('59f1a6b482100e1594f406e8');
            if(c && PIONEER.pos.inRangeTo(c, 1)) {
                PIONEER.claimController(c);
                PIONEER.signController(c, '🙃');
                // PIONEER.suicide();
                return;
            }
            return;
        }
    }
    if(Game.shard.name != 'shard3' && Game.shard.name != 'shard0') {
        _.forEach(Game.creeps, creep => creep.suicide());
        return;
    }

*/
