import { GlobalSettings } from "../globalSettings";
import { profile } from "../profiler/decorator";
import { Processes } from "../process/processes";
import { Process } from "../process/process";
import { Market } from "../extensions/market";

const errCode2description = {
    [OK]: 'OK',
    [ERR_NOT_OWNER]: 'ERR_NOT_OWNER',
    [ERR_NOT_ENOUGH_RESOURCES]: 'ERR_NOT_ENOUGH_RESOURCES',
    [ERR_INVALID_ARGS]: 'ERR_INVALID_ARGS',
    [ERR_TIRED]: 'ERR_TIRED',
    [ERR_FULL]: 'ERR_FULL',
    [ERR_INVALID_TARGET]: 'ERR_INVALID_TARGET',
    [ERR_NOT_IN_RANGE]: 'ERR_NOT_IN_RANGE',
    [ERR_RCL_NOT_ENOUGH]: 'ERR_RCL_NOT_ENOUGH'
}

const briefName = {
    energy: RESOURCE_ENERGY,
    power: RESOURCE_POWER,

    com: RESOURCE_COMPOSITE,
    cry: RESOURCE_CRYSTAL,
    liq: RESOURCE_LIQUID,

    metal0: RESOURCE_ALLOY,
    metal1: RESOURCE_TUBE,
    metal2: RESOURCE_FIXTURES,
    metal3: RESOURCE_FRAME,
    metal4: RESOURCE_HYDRAULICS,
    metal5: RESOURCE_MACHINE,

    bio: RESOURCE_BIOMASS,
    bio0: RESOURCE_CELL,
    bio1: RESOURCE_PHLEGM,
    bio2: RESOURCE_TISSUE,
    bio3: RESOURCE_MUSCLE,
    bio4: RESOURCE_ORGANOID,
    bio5: RESOURCE_ORGANISM,

    sil: RESOURCE_SILICON,
    sil0: RESOURCE_WIRE,
    sil1: RESOURCE_SWITCH,
    sil2: RESOURCE_TRANSISTOR,
    sil3: RESOURCE_MICROCHIP,
    sil4: RESOURCE_CIRCUIT,
    sil5: RESOURCE_DEVICE,

    mist0: RESOURCE_CONDENSATE,
    mist1: RESOURCE_CONCENTRATE,
    mist2: RESOURCE_EXTRACT,
    mist3: RESOURCE_SPIRIT,
    mist4: RESOURCE_EMANATION,
    mist5: RESOURCE_ESSENCE
}

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
                }
                if (flag.name.match('uncolony')) {
                    let roomName = flag.name.split('_')[1];
                    let targetName = flag.pos.roomName;
                    if (Memory.colonies[roomName]) {
                        _.remove(Memory.colonies[roomName], c => c.name == targetName);
                        if (Memory.stableData[targetName]) delete Memory.stableData[targetName];
                        delete Memory.rooms[targetName];
                    }
                    flag.remove();
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
                    if (!Process.getProcess(roomName, 'attack', 'targetRoom', flag.pos.roomName)) Processes.processAttack(roomName, flag.pos.roomName);
                    continue;
                }
                if (flag.name.match('ac')) {
                    let roomName = flag.name.split('_')[0];
                    let creepNum = Number.parseInt(flag.name.split('_')[2]);
                    if (!Process.getProcess(roomName, 'attackController', 'targetRoom', flag.pos.roomName)) Processes.processAttackController(roomName, flag.pos.roomName, creepNum);
                    continue;
                }
                if (flag.name.match('sh4')) {
                    let roomName = flag.name.split('_')[0];
                    if (!Process.getProcess(roomName, 'stronghold4', 'targetRoom', flag.pos.roomName)) Processes.processStrongHold4(roomName, flag.pos.roomName);
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
                    Processes.rebuildProcesses();

                    for (const colony of Memory.colonies[room.name]) {
                        delete Memory.rooms[colony.name];
                        delete Memory.stableData[colony.name];
                    }
                    delete Memory.colonies[room.name];

                    for (const flagName in Game.flags) {
                        const flag = Game.flags[flagName];
                        if (flag.pos.roomName == room.name) flag.remove();
                    }
                    room.structures.forEach(s => s.structureType != STRUCTURE_TERMINAL && s.destroy());
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

    static sellOrder(resourceType: ResourceConstant, amount: number, roomName: string, price?: number): string {
        return Command.order(resourceType, amount, roomName, ORDER_SELL, price);
    }

    static buyOrder(resourceType: ResourceConstant, amount: number, roomName: string, price?: number): string {
        return Command.order(resourceType, amount, roomName, ORDER_BUY, price);
    }

    static order(resourceType: ResourceConstant, amount: number, roomName: string, type: ORDER_BUY | ORDER_SELL, price?: number): string {
        price = price ? price : (Market.getMarketPrice(resourceType) + (type == ORDER_BUY ? 0.005 : -0.005));
        if (price > 1) console.log(`单子价格:${price}!`);
        const code = Game.market.createOrder({ type: type, totalAmount: amount, roomName: roomName, resourceType: resourceType, price: price })
        if (code === OK) return `成功在房间${roomName}挂${type == ORDER_BUY ? '购买' : '销售'}单子,资源:${resourceType},价格:${price},数量:${amount}`;
        else return `在房间${roomName}挂${type == ORDER_BUY ? '购买' : '销售'}单子,资源:${resourceType},价格:${price},数量:${amount}失败,返回值:${errCode2description[code]}`;
    }

    static send(resourceType: ResourceConstant, amount: number, des: string): string {
        for (const roomName in Game.rooms) {
            const room = Game.rooms[roomName];
            const controller = room.controller;
            if (!controller || !controller.my || !room.terminal) continue;
            if (roomName == des) continue;
            const store = room.terminal.store[resourceType];
            if (store >= amount) {
                const code = room.terminal.send(resourceType, amount, des);
                if (code === OK) {
                    return `成功从${roomName}传输${amount}个${resourceType}到${des}`;
                }
                else console.log(`从${roomName}传输${amount}个${resourceType}到${des}失败，返回值：${errCode2description[code]}`);
            }
        }
        return '传输失败';
    }

    static checkRoomEnvirounment(room: Room): boolean {
        if (!Memory.stableData[room.name].basePosition) return false;
        return true;
    }

    static launchNukes(des: [number, number, string][]) {
        let poses: RoomPosition[] = [];
        _.forEach(des, d => poses.push(new RoomPosition(d[0], d[1], d[2])));
        if (!poses.length) return '未传入有效目标';
        let nukes: StructureNuker[] = _.filter(Game.structures, structure => structure.structureType == STRUCTURE_NUKER) as StructureNuker[];
        nukes = nukes.filter(nuke => !nuke.store.getFreeCapacity(RESOURCE_ENERGY) && !nuke.store.getFreeCapacity(RESOURCE_GHODIUM) && !nuke.cooldown && _.any(poses, pos => Game.map.getRoomLinearDistance(pos.roomName, nuke.pos.roomName) <= 10) && nuke.isActive());
        if (!nukes.length) return '未找到可用核弹';
        let solutions: { [posIndex: number]: number }[] = [{ [-1]: -1 }];
        for (let pi = 0; pi < poses.length; pi++) {
            let newSolutions = Array(...solutions);
            solutions.forEach(solution => {
                for (let ni = 0; ni < nukes.length; ni++) {
                    let newSolution = _.clone(solution);
                    newSolution[ni] = pi;
                    newSolutions.push(newSolution);
                }
            });
            solutions = newSolutions;
        }
        solutions.map(solution => {
            delete solution[-1];
            _.forEach(solution, (pi: number, ni) => {
                let pos = poses[pi];
                let nuke = nukes[ni!] as StructureNuker;
                if (Game.map.getRoomLinearDistance(nuke.pos.roomName, pos.roomName) > 10) solution[ni!] = -1;
            });
            return solution;
        });
        let best = _.max(solutions, solution => _.countBy(_.uniq(Object.values(solution).filter(v => v !== -1)), pi => pi !== -1)['true']);
        if (best as any != -Infinity) {
            _.forEach(best, (ni: number, pi) => {
                let nuke = nukes[ni];
                let code = nuke.launchNuke(poses[pi!]);
                if (code == OK) {
                    console.log(`已从 ${nuke.room.name} 向 ${poses[pi!]} 发射核弹`);
                } else console.log(`从 ${nuke.room.name} 向 ${poses[pi!]} 发射核弹失败，返回值：${errCode2description[code]}`);
            });
            return '已找到完全解';
        }
        return '未寻找到解';
    }
}

(global as any).send = Command.send;
(global as any).order = Command.order;
(global as any).buyOrder = Command.buyOrder;
(global as any).sellOrder = Command.sellOrder;
(global as any).launchNukes = Command.launchNukes;
_.forEach(briefName, (type, brief) => (global as any)[brief!] = type);
