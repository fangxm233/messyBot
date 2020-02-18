import { GlobalSettings } from "../globalSettings";
import { profile } from "../profiler/decorator";
import { Porcesses } from "../process/processes";
import { Process } from "../process/process";

@profile
export class Command {
    static run() {
        let hasPoorFlag = false;
        let hasDismantleFlag = false;
        let hasHaulFlag = false;
        let hasSpawn = false;
        for (const flagName in Game.flags) {
            if (Game.flags.hasOwnProperty(flagName)) {
                const flag = Game.flags[flagName];
                if (flag.name == 'dismantle') {
                    hasDismantleFlag = true;
                    let smallestName, smallestRange = 999;
                    for (const spawnName in Game.spawns) {
                        const spawn = Game.spawns[spawnName];
                        if (spawn.pos.getSqrtRoomRangeTo(flag.pos) < smallestRange && spawn.isActive()) {
                            smallestName = spawn.room.name;
                            smallestRange = spawn.pos.getSqrtRoomRangeTo(flag.pos);
                        }
                    }
                    Memory.dismantlerRoom = smallestName;
                }
                if (flag.name == 'haul') {
                    hasHaulFlag = true;
                    let smallestName, smallestRange = 999;
                    for (const spawnName in Game.spawns) {
                        const spawn = Game.spawns[spawnName];
                        if (spawn.pos.getSqrtRoomRangeTo(flag.pos) < smallestRange) {
                            smallestName = spawn.room.name;
                            smallestRange = spawn.pos.getSqrtRoomRangeTo(flag.pos);
                        }
                    }
                    Memory.haulerRoom = smallestName;
                }
                if (flag.name.match('colony')) {
                    let roomName = flag.name.split('_')[1];
                    let targetName = flag.pos.roomName;
                    if (Memory.colonies[roomName]) {
                        let isExist = false;
                        for (const c of Memory.colonies[roomName]) {
                            if (c.name == targetName) isExist = true;
                        }
                        if (!isExist) Memory.colonies[roomName].push({ name: targetName, controller: '', enable: true });
                    }
                    continue;
                }
                if (flag.name.match('uncolony')) {
                    let roomName = flag.name.split('_')[1];
                    let targetName = flag.pos.roomName;
                    _.remove(Memory.colonies[roomName], config => config.name == targetName);
                    delete Memory.processes[targetName];
                    delete Memory.rooms[targetName];
                    delete Memory.market[targetName];
                    continue;
                }
                if (flag.name == 'poor') {
                    Memory.poorRoom = flag.pos.roomName;
                    hasPoorFlag = true;
                    continue;
                }
                if (flag.name == 'spawn') {
                    Memory.spawnRoom = flag.pos.roomName;
                    hasSpawn = true;
                    let smallestName, smallestRange = 999;
                    for (const spawnName in Game.spawns) {
                        const spawn = Game.spawns[spawnName];
                        // if(!spawn.room.storage) continue;
                        if (spawn.pos.getSqrtRoomRangeTo(flag.pos) < smallestRange && spawn.isActive()) {
                            smallestName = spawn.room.name;
                            smallestRange = spawn.pos.getSqrtRoomRangeTo(flag.pos);
                        }
                    }
                    Memory.expandRoom = smallestName;

                    if (!Memory.stableData[flag.pos.roomName]) Memory.stableData[flag.pos.roomName] = {} as any;
                    Memory.stableData[flag.pos.roomName].basePosition = {
                        x: flag.pos.x,
                        y: flag.pos.y,
                    };
                    continue;
                }
                if (flag.name.match('enable')) {
                    let enable = flag.name.split('_')[2] == 'true';
                    let roomName = flag.name.split('_')[1];
                    if (Memory.colonies[roomName]) {
                        for (const c of Memory.colonies[roomName]) {
                            if (c.name == flag.pos.roomName) c.enable = enable;
                        }
                    }
                    continue;
                }
                if (flag.name.match('ar') || flag.name.match('ad')) {
                    let roomName = flag.name.split('_')[0];
                    if (!Process.getProcess(roomName, 'attack', 'targetRoom', flag.pos.roomName)) Porcesses.processAttack(roomName, flag.pos.roomName);
                    continue;
                }
                if (flag.name.match('ac')) {
                    let roomName = flag.name.split('_')[0];
                    let creepNum = Number.parseInt(flag.name.split('_')[2]);
                    if (!Process.getProcess(roomName, 'attackController', 'targetRoom', flag.pos.roomName)) Porcesses.processAttackController(roomName, flag.pos.roomName, creepNum);
                    continue;
                }
                if (!flag.room) continue;
                let room = flag.room;
                if (flag.name.match('base')) {
                    if (!Memory.stableData[room.name]) Memory.stableData[room.name] = {} as any;
                    Memory.stableData[room.name].basePosition = {
                        x: flag.pos.x,
                        y: flag.pos.y,
                    };
                    flag.remove();
                    continue;
                }
                // if(flag.name.match('har')){
                //     let id = Number.parseInt(flag.name.split('_')[2]);
                //     if(!Memory.stableData[room.name]) Memory.stableData[room.name] = {} as any;
                //     if(!Memory.stableData[room.name].harvesterPosition) Memory.stableData[room.name].harvesterPosition = {} as any;
                //     Memory.stableData[room.name].harvesterPosition[id] = flag.pos;
                //     flag.remove();
                //     continue;
                // }
                // if(flag.name.match('trader')){
                //     if(!Memory.rooms[room.name]) return;
                //     Memory.rooms[flag.room.name].traderPos = flag.pos;
                //     continue;
                // }
                // if(flag.name.match('stable')){
                //     if(!Memory.rooms[room.name]) return;
                //     Memory.rooms[flag.room.name].stableTransporterPos = flag.pos;
                //     continue;
                // }
                if (flag.name == 'unclaim') {
                    let roomName = flag.pos.roomName;
                    delete Memory.rooms[room.name];
                    delete Memory.market[room.name];
                    delete Memory.statistics[room.name];
                    delete Memory.stableData[room.name];
                    delete Memory.processes[room.name];
                    Porcesses.rebuildProcesses();

                    for (const colony of Memory.colonies[room.name]) {
                        delete Memory.rooms[colony.name];
                        delete Memory.stableData[colony.name];
                    }
                    delete Memory.colonies[room.name];

                    for (const flagName in Game.flags) {
                        const flag = Game.flags[flagName];
                        if (flag.pos.roomName == room.name) flag.remove();
                    }
                    room.structures.forEach(s => s.destroy());
                    room.find(FIND_CONSTRUCTION_SITES).forEach(s => s.remove());
                    for (const name in Game.creeps) {
                        const creep = Game.creeps[name];
                        if (creep.memory.spawnRoom == roomName) creep.suicide();
                    }
                    if (room.controller) room.controller.unclaim();
                    continue;
                }
            }
        }
        if (!hasPoorFlag) delete Memory.poorRoom;
        if (!hasSpawn) {
            delete Memory.spawnRoom;
            delete Memory.expandRoom;
            Memory.claimed = false;
        }
        if (!hasDismantleFlag) {
            Memory.gotoDismantle = true;
            delete Memory.dismantlerRoom;
        }
        if (!hasHaulFlag) {
            Memory.gotoHaul = true;
            delete Memory.haulerRoom;
        }
    }

    static checkRoomEnvirounment(room: Room): boolean {
        if (!Memory.stableData[room.name].basePosition) return false;
        return true;
    }
}
