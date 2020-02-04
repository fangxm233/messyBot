import { structureLayout } from './building';
import { profile } from '../profiler/decorator';
import { EXISTING_PATH_COST, PLAIN_COST, SWAMP_COST, WALL_COST, RoadPlanner } from './RoadPlanner';
import { intel } from '../programs/Intel';
import { Visualizer } from '../programs/Visualizer';
import { toRoomPosition, refreshRoomPosition } from '../utils';
import { ALLOT_HARVEST } from '../logistics/alloter';
import { MAP_ON, BarrierPlanner } from './BarrierPlanner';

export const fillerCount = {
    1: 1,
    2: 1,
    3: 1,
    4: 2,
    5: 2,
    6: 3,
    7: 3,
    8: 3,
}

const fillerOrder: { [index: number]: Coord } = {
    0: { x: 4, y: 8 },
    1: { x: 4, y: 9 },
    2: { x: 4, y: 10 },
    3: { x: 3, y: 10 },
    4: { x: 2, y: 10 },
    5: { x: 2, y: 9 },

    6: { x: 1, y: 8 },

    7: { x: 1, y: 10 },
    8: { x: 0, y: 10 },
    9: { x: 0, y: 9 },
    10: { x: 0, y: 8 },

    11: { x: 2, y: 7 },

    12: { x: 2, y: 6 },
    13: { x: 1, y: 6 },
    14: { x: 0, y: 6 },
    15: { x: 0, y: 7 },
}

interface RoomStructuresInterface {
    structures: StructureInPos[];

    getAt(x: number, y: number): StructureInPos;
    getAt(pos: Coord): StructureInPos;

    getForAt<T extends StructureConstant>(type: T, x: number, y: number): StructureTypes[T] | undefined;
    getForAt<T extends StructureConstant>(type: T, pos: Coord): StructureTypes[T] | undefined;

    setStructure(structure: AnyStructure, x: number, y: number): void;
    setStructure(structure: AnyStructure, pos: Coord): void;
}

@profile
class RoomStructures implements RoomStructuresInterface {
    structures: StructureInPos[];
    time: number;

    constructor() {
        this.time = Game.time;
        this.structures = [];
    }

    getAt(x: number, y: number): StructureInPos;
    getAt(pos: Coord): StructureInPos;

    getAt(x: number | { x: number; y: number; }, y?: number): StructureInPos {
        if (typeof x != 'number') {
            y = x.y;
            x = x.x;
        }
        if (y == undefined) return {};
        if (x < 1 || x > 48 || y < 1 || y > 48) return {};
        x--; y--;

        let index = y * 47 + x;
        return this.refresh(this.structures[index] || {});
    }

    getForAt<T extends StructureConstant>(type: T, x: number, y: number): StructureTypes[T] | undefined;
    getForAt<T extends StructureConstant>(type: T, pos: Coord): StructureTypes[T] | undefined;

    getForAt<T extends StructureConstant>(type: T, x: number | Coord, y?: number): StructureTypes[T] | undefined {
        if (typeof x != 'number') {
            y = x.y;
            x = x.x;
        }
        if (y == undefined) return;
        return this.getAt(x, y)[type] as any;
    }

    setStructure(structure: AnyStructure, x: number, y: number): void;
    setStructure(structure: AnyStructure, pos: Coord): void;

    setStructure(structure: AnyStructure, x: number | Coord, y?: number): void {
        if (typeof x != 'number') {
            y = x.y;
            x = x.x;
        }
        if (y == undefined) return;
        if (x < 1 || x > 48 || y < 1 || y > 48) return;
        x--; y--;

        let index = y * 47 + x;
        if (!this.structures[index]) this.structures[index] = { time: Game.time } as any;
        this.structures[index][structure.structureType] = structure as any;
    }

    private refresh(structureInPos: StructureInPos): StructureInPos {
        let s: any = structureInPos;
        if (s.time == Game.time) return structureInPos;
        s.time = Game.time;
        for (const key in structureInPos) {
            if (key == 'time') continue;
            const element = structureInPos[key];
            if (!element) continue;
            structureInPos[key] = Game.getObjectById(element.id);
        }
        return structureInPos;
    }
}

type StructureInPos = {
    [structureType in StructureConstant]?: StructureTypes[structureType];
};

@profile
export class RoomPlanner {
    public readonly roomName: string;
    public readonly rcl: number;
    public readonly basePosition: Coord;

    private static roomBuiding: {
        [roomName: string]: RoomStructures;
    };

    constructor(roomName: string) {
        this.roomName = roomName;
        let room = Game.rooms[roomName];
        if (room && room.controller) {
            this.rcl = room.controller.level;
        }
        if (Memory.stableData[roomName])
            this.basePosition = Memory.stableData[roomName].basePosition;
    }

    public planRoom(targetName: string) {
        let owned = false;
        let targetRoom = Game.rooms[targetName];
        if (targetRoom) {
            let controller = targetRoom.controller;
            if (controller && controller.my) owned = true;
        }

        if (!Memory.stableData[targetName]) Memory.stableData[targetName] = { harvesterPosition: {} } as any;
        if (!Memory.stableData[targetName].harvesterPosition) Memory.stableData[targetName].harvesterPosition = {} as any;
        if (!Memory.rooms[targetName].allot || !Memory.rooms[targetName].allot[ALLOT_HARVEST]) return;
        for (const allot of Memory.rooms[targetName].allot[ALLOT_HARVEST]) {
            Memory.stableData[targetName].harvesterPosition[allot.id] = refreshRoomPosition(allot.data.pos);
        }

        let { paths, finished } = new RoadPlanner(this.roomName).generateRoomPath(targetName);
        let stable = Memory.stableData[targetName];
        let matrix = intel[targetName].buildingCostMatrix;
        _.defaults(stable, {
            harvesterPosition: {},
            containerPosition: {},
            linkPosition: {},
            harvesterPath: {}
        })

        if (!finished) return;

        finished = true;

        for (const posId in stable.harvesterPosition) {
            const pos = refreshRoomPosition(stable.harvesterPosition[posId]);
            let availableC = pos.availableNeighbors(true, true).filter(pos => matrix.get(pos.x, pos.y) == EXISTING_PATH_COST)[0];
            if (!availableC) {
                console.log(`<span style='color:red'>can't plan harvest container because no available position :${pos}</span>`);
                finished = false;
                continue;
            }
            stable.harvesterPosition[posId] = availableC;
            stable.containerPosition['h' + posId] = availableC;

            if (owned) {
                let availableL = _.min(availableC.availableNeighbors(true, true)
                    .filter(pos => matrix.get(pos.x, pos.y) == PLAIN_COST || matrix.get(pos.x, pos.y) == SWAMP_COST),
                    pos => pos.getRangeTo(toRoomPosition(this.basePosition, this.roomName)));
                if (!availableL) {
                    console.log(`<span style='color:red'>can't plan harvest link because no available position :${pos}</span>`);
                    finished = false;
                    continue;
                }
                stable.linkPosition['h' + posId] = availableL;
            }
        }

        if (owned) {
            let mineral = targetRoom.find(FIND_MINERALS)[0];
            if (mineral) {
                let available = mineral.pos.availableNeighbors(true, true).filter(pos => matrix.get(pos.x, pos.y) == EXISTING_PATH_COST)[0];
                if (!available) {
                    console.log(`<span style='color:red'>can't plan mineral because no available position!</span>`);
                    finished = false;
                } else {
                    stable.containerPosition.m = available;
                }
            }

            let controller = targetRoom.controller;
            if (controller) {
                let road = controller.pos.availableNeighbors(true, true).filter(pos => matrix.get(pos.x, pos.y) == EXISTING_PATH_COST)[0];
                let available = _.min(road.availableNeighbors(true, true)
                    .filter(pos => matrix.get(pos.x, pos.y) == PLAIN_COST || matrix.get(pos.x, pos.y) == SWAMP_COST),
                    pos => pos.getRangeTo(toRoomPosition(this.basePosition, this.roomName)));
                if (!available) {
                    console.log(`<span style='color:red'>can't plan controller because no available position</span>`);
                    finished = false;
                } else {
                    stable.linkPosition.u = available;
                }
            }
        }

        for (const Id in paths.harvesterPath) {
            const path = paths.harvesterPath[Id];
            let unzip = RoadPlanner.unzipPath(path);
            unzip.splice(unzip.length - 2, 2);
            Visualizer.drawRoads(unzip);
            stable.harvesterPath[Id] = RoadPlanner.zipPath(unzip)
        }

        if (paths.controllerPath) {
            let unzip = RoadPlanner.unzipPath(paths.controllerPath);
            unzip.splice(unzip.length - 2, 2);
            Visualizer.drawRoads(unzip);
            new RoomVisual(targetName).structure(stable.linkPosition.u.x, stable.linkPosition.u.y, STRUCTURE_LINK);
            stable.controllerPath = RoadPlanner.zipPath(unzip)
        }

        if (paths.mineralPath) {
            let unzip = RoadPlanner.unzipPath(paths.mineralPath);
            unzip.splice(unzip.length - 2, 2);
            Visualizer.drawRoads(unzip);
            new RoomVisual(targetName).structure(stable.containerPosition.m.x, stable.containerPosition.m.y, STRUCTURE_CONTAINER);
            stable.mineralPath = RoadPlanner.zipPath(unzip)
        }

        stable.finished = finished;

        // {
        //     if(owned){
        //         let h0link = stable.linkPosition.h0;
        //         let h1link = stable.linkPosition.h1;
        //         new RoomVisual(targetName).structure(h0link.x, h0link.y, STRUCTURE_LINK)
        //         .structure(h1link.x, h1link.y, STRUCTURE_LINK);
        //     }
        //     let h0con = stable.containerPosition.h0;
        //     let h1con = stable.containerPosition.h1;
        //     new RoomVisual(targetName).structure(h0con.x, h0con.y, STRUCTURE_CONTAINER)
        //         .structure(h1con.x, h1con.y, STRUCTURE_CONTAINER);
        // }

        console.log('finished plan room', targetName);
    }

    public generateBuildingCostMarix(): CostMatrix {
        let room = Game.rooms[this.roomName];
        let owned = false;
        if (room && room.controller && room.controller.my) owned = true;

        let matrix = new PathFinder.CostMatrix();

        if (Memory.stableData[this.roomName]) {
            let stable = Memory.stableData[this.roomName];

            if (stable.finished) {
                for (const id in stable.harvesterPath) {
                    const path = stable.harvesterPath[id] as savedPath;
                    let unzip = RoadPlanner.unzipPath(path);

                    this.addPosToMatrix(matrix, unzip, EXISTING_PATH_COST, false);
                }

                if (owned) {
                    let c = RoadPlanner.unzipPath(stable.controllerPath);
                    this.addPosToMatrix(matrix, c, EXISTING_PATH_COST, false);

                    let m = RoadPlanner.unzipPath(stable.mineralPath);
                    this.addPosToMatrix(matrix, m, EXISTING_PATH_COST, false);
                }
            }
        }

        if (owned && Memory.colonies[this.roomName]) {
            for (const colony of Memory.colonies[this.roomName]) {
                let stable = Memory.stableData[colony.name];

                if (stable && stable.finished) {
                    for (const id in stable.harvesterPath) {
                        const path = stable.harvesterPath[id] as savedPath;
                        let unzip = RoadPlanner.unzipPath(path).filter(pos => pos.roomName == this.roomName);

                        this.addPosToMatrix(matrix, unzip, EXISTING_PATH_COST, false);
                    }
                }
            }
        }

        let terrain = Game.map.getRoomTerrain(this.roomName);

        for (let y = 0; y < 50; ++y) {
            for (let x = 0; x < 50; ++x) {
                switch (terrain.get(x, y)) {
                    case TERRAIN_MASK_SWAMP:
                        matrix.set(x, y, SWAMP_COST);
                        break;
                    case TERRAIN_MASK_WALL:
                        if (x != 0 && y != 0 && x != 49 && y != 49) {
                            // Can't tunnel through walls on edge tiles
                            matrix.set(x, y, WALL_COST);
                        }
                        break;
                    default: // plain
                        matrix.set(x, y, PLAIN_COST);
                        break;
                }
            }
        }

        for (let x = 0; x < 50; x++) {
            matrix.set(x, 0, terrain.get(x, 0) == 0 ? PLAIN_COST * 2 : 0xff);
            matrix.set(x, 49, terrain.get(x, 49) == 0 ? PLAIN_COST * 2 : 0xff);
        }
        for (let y = 0; y < 50; y++) {
            matrix.set(0, y, terrain.get(0, y) == 0 ? PLAIN_COST * 2 : 0xff);
            matrix.set(49, y, terrain.get(49, y) == 0 ? PLAIN_COST * 2 : 0xff);
        }

        if (owned) {
            let buildings = structureLayout[8].buildings;

            this.addPosToMatrix(matrix, buildings.extension.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.spawn.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.link.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.tower.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.terminal.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.storage.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.lab.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.powerSpawn.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.factory.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.nuker.pos, 0xff);
            this.addPosToMatrix(matrix, buildings.observer.pos, 0xff);

            this.addPosToMatrix(matrix, buildings.road.pos, EXISTING_PATH_COST);

            for (let x = -1; x < 12; x++) {
                let pos = this.toRoomPos({ x: x, y: -1 });
                if (!(x >= 4 && x <= 6)) matrix.set(pos.x, pos.y, 0xff);
                if (!(x >= 4 && x <= 6)) matrix.set(pos.x, pos.y + 12, 0xff);
            }
            for (let y = -1; y < 12; y++) {
                let pos = this.toRoomPos({ x: -1, y: y });
                if (!(y >= 4 && y <= 6)) matrix.set(pos.x, pos.y, 0xff);
                if (!(y >= 4 && y <= 6)) matrix.set(pos.x + 12, pos.y, 0xff);
            }
        } else if (room) {
            room.structures.forEach(structure => matrix.set(structure.pos.x, structure.pos.y,
                !structure.isWalkable ? 0xff : structure.structureType == STRUCTURE_ROAD ? EXISTING_PATH_COST : PLAIN_COST))
        }

        return matrix;
    }

    private addPosToMatrix(matrix: CostMatrix, poses: Coord[], cost: number, transform: boolean = true) {
        for (const pos of poses) {
            let p = transform ? this.toRoomPos(pos) : pos;
            matrix.set(p.x, p.y, cost);
        }
    }

    public buildMissingBuildings(): boolean {
        if (!this.basePosition) return false;

        let room = Game.rooms[this.roomName];
        if (!room) return false;
        if (room.find(FIND_CONSTRUCTION_SITES).length) return false;
        let layout = structureLayout[this.rcl].buildings;

        if (room.storage && this.rcl >= 7) {
            let bp = new BarrierPlanner(this.roomName);
            bp.planRoomBarrier();
            this.clearBuildings(bp.barrierMap);
            this.coverRampartAndWall(bp);
        }

        let missingSpawn = this.checkMissongBuildings(STRUCTURE_SPAWN, layout.spawn.pos);
        if (missingSpawn && missingSpawn.length) {
            this.createConstructionSites(STRUCTURE_SPAWN, missingSpawn, true);
            return false;;
        }

        let missingRoad = this.checkMissongBuildings(STRUCTURE_ROAD, layout.road.pos);
        if (missingRoad && missingRoad.length) {
            this.createConstructionSites(STRUCTURE_ROAD, missingRoad, true);
            return false;
        }

        let stable = Memory.stableData[this.roomName];
        if (this.rcl >= 3) {
            for (const Id in stable.harvesterPath) {
                const path = stable.harvesterPath[Id] as savedPath;
                let missingRoad = this.checkMissongBuildings(STRUCTURE_ROAD, RoadPlanner.unzipPath(path), false);
                if (missingRoad && missingRoad.length) {
                    this.createConstructionSites(STRUCTURE_ROAD, missingRoad, true, false);
                    return false;
                }
            }

            for (const colony of Memory.colonies[this.roomName]) {
                let stable = Memory.stableData[colony.name];
                for (const Id in stable.harvesterPath) {
                    const path = stable.harvesterPath[Id] as savedPath;
                    const unzip = RoadPlanner.unzipPath(path);

                    for (const pathSeg of path.paths) {
                        let missingRoad = new RoomPlanner(pathSeg.pos.roomName).checkMissongBuildings(STRUCTURE_ROAD,
                            unzip.filter(pos => pos.roomName == pathSeg.pos.roomName), false);
                        if (missingRoad && missingRoad.length) {
                            new RoomPlanner(pathSeg.pos.roomName).createConstructionSites(STRUCTURE_ROAD, missingRoad, true, false);
                            // return false;
                        }
                    }
                }
            }

            missingRoad = this.checkMissongBuildings(STRUCTURE_ROAD, RoadPlanner.unzipPath(stable.controllerPath), false);
            if (missingRoad && missingRoad.length) {
                this.createConstructionSites(STRUCTURE_ROAD, missingRoad, true, false);
                return false;
            }

            if (this.rcl >= 6) {
                missingRoad = this.checkMissongBuildings(STRUCTURE_ROAD, RoadPlanner.unzipPath(stable.mineralPath), false);
                if (missingRoad && missingRoad.length) {
                    this.createConstructionSites(STRUCTURE_ROAD, missingRoad, true, false);
                }
            }
        }

        let missingExtension = this.checkMissongBuildings(STRUCTURE_EXTENSION, layout.extension.pos);
        if (missingExtension && missingExtension.length) {
            this.createConstructionSites(STRUCTURE_EXTENSION, missingExtension, true);
            return false;
        }

        let missingStorage = this.checkMissongBuildings(STRUCTURE_STORAGE, layout.storage.pos);
        if (missingStorage && missingStorage.length) {
            this.createConstructionSites(STRUCTURE_STORAGE, missingStorage, true);
            return false;
        }

        let missingLink = this.checkMissongBuildings(STRUCTURE_LINK, layout.link.pos);
        if (missingLink && missingLink.length) {
            this.createConstructionSites(STRUCTURE_LINK, missingLink, true);
            return false;
        }

        if (this.rcl >= 5) {
            let missingLink = this.checkMissongBuildings(STRUCTURE_LINK, [stable.linkPosition.u], false);
            if (missingLink && missingLink.length) {
                this.createConstructionSites(STRUCTURE_LINK, missingLink, true, false);
                return false;
            }

            if (this.rcl >= 6) {
                if (stable.linkPosition.h1) {
                    let missingLink = this.checkMissongBuildings(STRUCTURE_LINK, [stable.linkPosition.h1], false);
                    if (missingLink && missingLink.length) {
                        this.createConstructionSites(STRUCTURE_LINK, missingLink, true, false);
                        return false;
                    }
                }
                if (this.rcl >= 7 && stable.linkPosition.h0) {
                    let missingLink = this.checkMissongBuildings(STRUCTURE_LINK, [stable.linkPosition.h0], false);
                    if (missingLink && missingLink.length) {
                        this.createConstructionSites(STRUCTURE_LINK, missingLink, true, false);
                        return false;
                    }
                }
            }
        }

        let missingContainer = this.checkMissongBuildings(STRUCTURE_CONTAINER, layout.container.pos);
        if (missingContainer && missingContainer.length) {
            this.createConstructionSites(STRUCTURE_CONTAINER, missingContainer, true);
            return false;
        }

        if (this.rcl >= 3) {
            for (const colony of Memory.colonies[this.roomName]) {
                let stable = Memory.stableData[colony.name];
                for (const Id in stable.harvesterPosition) {
                    const pos = stable.harvesterPosition[Id];
                    let missingContainer = new RoomPlanner(colony.name).checkMissongBuildings(STRUCTURE_CONTAINER, [pos], false);
                    if (missingContainer && missingContainer.length) {
                        new RoomPlanner(colony.name).createConstructionSites(STRUCTURE_CONTAINER, missingContainer, true, false);
                    }
                }
            }
        }

        if (this.rcl < 7 && this.rcl > 2) {
            if (stable.harvesterPosition[0]) {
                let missingContainer = this.checkMissongBuildings(STRUCTURE_CONTAINER, [stable.harvesterPosition[0]], false);
                if (missingContainer && missingContainer.length) {
                    this.createConstructionSites(STRUCTURE_CONTAINER, missingContainer, true, false);
                    return false;
                }
            }
            if (this.rcl < 6 && stable.harvesterPosition[1]) {
                let missingContainer = this.checkMissongBuildings(STRUCTURE_CONTAINER, [stable.harvesterPosition[1]], false);
                if (missingContainer && missingContainer.length) {
                    this.createConstructionSites(STRUCTURE_CONTAINER, missingContainer, true, false);
                    return false;
                }
            }
        }

        let missingTower = this.checkMissongBuildings(STRUCTURE_TOWER, layout.tower.pos);
        if (missingTower && missingTower.length) {
            this.createConstructionSites(STRUCTURE_TOWER, missingTower, true);
            return false;
        }

        if (this.rcl >= 6) {
            let mineral = Game.getObjectById<Mineral>(Memory.rooms[this.roomName].mineral.mineralId);
            if (mineral) {
                let missingContainer = this.checkMissongBuildings(STRUCTURE_CONTAINER, [stable.containerPosition.m], false);
                if (missingContainer && missingContainer.length) {
                    this.createConstructionSites(STRUCTURE_CONTAINER, missingContainer, true, false);
                }

                let structures = _.filter(mineral.pos.lookFor(LOOK_STRUCTURES), structure => structure.structureType == STRUCTURE_EXTRACTOR);
                if (!structures.length) this.createConstructionSites(STRUCTURE_EXTRACTOR, [mineral.pos], true, false);
            }
        }

        if (room.storage && room.storage.store.energy < 300000) return false;
        let missingterminal = this.checkMissongBuildings(STRUCTURE_TERMINAL, layout.terminal.pos);
        if (missingterminal && missingterminal.length) {
            this.createConstructionSites(STRUCTURE_TERMINAL, missingterminal, true);
            return false;
        }

        let missingFactory = this.checkMissongBuildings(STRUCTURE_FACTORY, layout.factory.pos);
        if (missingFactory && missingFactory.length) {
            this.createConstructionSites(STRUCTURE_FACTORY, missingFactory, true);
            return false;
        }

        let missingPowerSpawn = this.checkMissongBuildings(STRUCTURE_POWER_SPAWN, layout.powerSpawn.pos);
        if (missingPowerSpawn && missingPowerSpawn.length) {
            this.createConstructionSites(STRUCTURE_POWER_SPAWN, missingPowerSpawn, true);
            return false;
        }

        let missingNuker = this.checkMissongBuildings(STRUCTURE_NUKER, layout.nuker.pos);
        if (missingNuker && missingNuker.length) {
            this.createConstructionSites(STRUCTURE_NUKER, missingNuker, true);
            return false;
        }

        let missingObserver = this.checkMissongBuildings(STRUCTURE_OBSERVER, layout.observer.pos);
        if (missingObserver && missingObserver.length) {
            this.createConstructionSites(STRUCTURE_OBSERVER, missingObserver, true);
            return false;
        }

        let missingLab = this.checkMissongBuildings(STRUCTURE_LAB, layout.lab.pos);
        if (missingLab && missingLab.length) {
            this.createConstructionSites(STRUCTURE_LAB, missingLab, true);
            return false;
        }

        return true;
    }

    public checkMissongBuildings(type: BuildableStructureConstant, positions: Coord[], transform: boolean = true): Coord[] | undefined {
        let terrain = Game.map.getRoomTerrain(this.roomName);

        let result: Coord[] = [];
        for (const pos of positions) {
            let p = transform ? this.toRoomPos(pos) : pos;
            if (!this.getForAt(type, p) && terrain.get(p.x, p.y) != TERRAIN_MASK_WALL) result.push(pos);
        }
        return result;
    }

    public createConstructionSites(type: BuildableStructureConstant, pos: Coord[], destroy: boolean, transform: boolean = true) {
        console.log(this.roomName, 'hi', type)
        for (const p of pos) {
            // let code = 0;
            // console.log('create constructionSite', type, p);
            this.createConstructionSite(type, p, destroy, transform);
        }
    }

    public createConstructionSite(type: BuildableStructureConstant, pos: Coord, destroy: boolean, transform: boolean = true) {
        let p = transform ? this.toRoomPos(pos) : toRoomPosition(pos, this.roomName);
        if (!Game.rooms[p.roomName]) return;
        let code = p.createConstructionSite(type);
        if (code == ERR_INVALID_TARGET && destroy) {
            let buildings = this.getAt(p);
            for (const buildingType in buildings) {
                if (buildingType == 'time') continue;
                const building = buildings[buildingType];
                building.destroy();
            }
        }
    }

    public getSpawn(id: number): StructureSpawn | undefined {
        if (id == 1 && this.rcl < 7 || id == 2 && this.rcl != 8) return undefined;

        let pos = structureLayout[this.rcl].buildings.spawn.pos[id];
        return this.getForAtBase(STRUCTURE_SPAWN, pos);
    }

    public getFillerContainer(id: number): StructureContainer | undefined {
        if (id > fillerCount[this.rcl] - 1) return undefined;

        let pos = structureLayout[this.rcl].buildings.container.pos[id];
        if (!pos) return;
        return this.getForAtBase(STRUCTURE_CONTAINER, pos);
    }

    public isFillerContainer(container: StructureContainer): boolean {
        if (!this.basePosition) return false;
        let cpos = container.pos;
        let poses: Coord[] = structureLayout[this.rcl].buildings.container.pos;
        for (const pos of poses) {
            if (pos.x == 5 && pos.y == 6) continue;
            if (pos.x + this.basePosition.x == cpos.x && pos.y + this.basePosition.y == cpos.y) return true;
        }
        return false;
    }

    public getConsumeOrdr(): (StructureExtension | StructureSpawn)[] {
        let order: (StructureExtension | StructureSpawn)[] = [];

        for (let region = 0; region < 3; region++) {
            let spawn = this.getSpawn(region);
            if (spawn) order.push(spawn);
            for (let index = 0; index < 6; index++) {
                let structure = this.getForAtBase(STRUCTURE_EXTENSION, this.getExstensionPos(region, index));
                if (structure) order.push(structure);
            }
        }

        for (let region = 0; region < 3; region++) {
            for (let index = 6; index < 11; index++) {
                let structure = this.getForAtBase(STRUCTURE_EXTENSION, this.getExstensionPos(region, index));
                if (structure) order.push(structure);
            }
        }

        for (let region = 0; region < 3; region++) {
            for (let index = 11; index < 16; index++) {
                let structure = this.getForAtBase(STRUCTURE_EXTENSION, this.getExstensionPos(region, index));
                if (structure) order.push(structure);
            }
        }

        return order;
    }

    public getActionOrder(region: number): FillingAction[] {
        let order: FillingAction[] = [];

        let spawn = this.getSpawn(region);
        order.push({ structure: spawn });
        for (let index = 0; index < 6; index++) {
            let structure = this.getForAtBase(STRUCTURE_EXTENSION, this.getExstensionPos(region, index));
            order.push({ structure: structure });
            if (index == 5) order.push({ pos: this.getPosByRegion(region, { x: 2, y: 8 }) });
        }

        for (let index = 6; index < 11; index++) {
            let structure = this.getForAtBase(STRUCTURE_EXTENSION, this.getExstensionPos(region, index));
            order.push({ structure: structure });
            if (index == 6) order.push({ pos: this.getPosByRegion(region, { x: 1, y: 9 }) });
            if (index == 10) order.push({ pos: this.getPosByRegion(region, { x: 2, y: 8 }) });
        }

        for (let index = 11; index < 16; index++) {
            let structure = this.getForAtBase(STRUCTURE_EXTENSION, this.getExstensionPos(region, index));
            order.push({ structure: structure });
            if (index == 11) order.push({ pos: this.getPosByRegion(region, { x: 1, y: 7 }) });
            if (index == 15) order.push({ pos: this.getPosByRegion(region, { x: 2, y: 8 }) });
        }

        return order;
    }

    public getExstensionPos(region: number, index: number): Coord {
        return this.getPosByRegion(region, fillerOrder[index]);
    }

    public getCenterPos(): RoomPosition {
        return new RoomPosition(this.basePosition.x + 5, this.basePosition.y + 5, this.roomName);
    }

    public getBoostPos(): RoomPosition {
        return new RoomPosition(this.basePosition.x + 8, this.basePosition.y + 2, this.roomName);
    }

    public getLabs(): StructureLab[] {
        if (this.rcl < 8) return [];
        return _.compact(structureLayout[this.rcl].buildings[STRUCTURE_LAB].pos.map(coord => this.getForAtBase(STRUCTURE_LAB, coord))) as any;
    }

    public getMineralLabs(): StructureLab[] {
        if (this.rcl < 8) return [];
        let labs = structureLayout[this.rcl].buildings[STRUCTURE_LAB].pos;
        return _.compact([this.getForAtBase(STRUCTURE_LAB, labs[4]), this.getForAtBase(STRUCTURE_LAB, labs[5])]) as any;
    }

    public getProductLabs(): StructureLab[] {
        if (this.rcl < 8) return [];
        let labs = structureLayout[this.rcl].buildings[STRUCTURE_LAB].pos;
        return _.compact([this.getForAtBase(STRUCTURE_LAB, labs[0]), this.getForAtBase(STRUCTURE_LAB, labs[1]),
        this.getForAtBase(STRUCTURE_LAB, labs[2]), this.getForAtBase(STRUCTURE_LAB, labs[3]),
        this.getForAtBase(STRUCTURE_LAB, labs[6]), this.getForAtBase(STRUCTURE_LAB, labs[7]),
        this.getForAtBase(STRUCTURE_LAB, labs[8]), this.getForAtBase(STRUCTURE_LAB, labs[9])]) as any;
    }

    public getPosByRegion(region: number, pos: Coord): Coord {
        if (region == 0) return pos;
        if (region == 1) return { x: 10 - pos.x, y: pos.y };
        if (region == 2) return { x: pos.x, y: 10 - pos.y };
        throw new Error('invalid arguement!');
    }


    public coverRampartAndWall(bp: BarrierPlanner): boolean {
        let missingRamparts = this.checkMissongBuildings(STRUCTURE_RAMPART, bp.ramparts, false);
        if (missingRamparts && missingRamparts.length) {
            this.createConstructionSites(STRUCTURE_RAMPART, missingRamparts, true, false);
        }
        // for (let x = -4; x < 15; x++) {
        //     if(!this.getForAtBase(STRUCTURE_RAMPART, {x: x, y: -4})) {
        //         let pos = this.toRoomPos({x: x, y: -4});
        //         let code = pos.createConstructionSite(STRUCTURE_RAMPART);
        //         if(code == ERR_FULL) return false;
        //     }
        //     if(!this.getForAtBase(STRUCTURE_RAMPART, {x: x, y: 14})) {
        //         let pos = this.toRoomPos({x: x, y: 14});
        //         let code = pos.createConstructionSite(STRUCTURE_RAMPART);
        //         if(code == ERR_FULL) return false;
        //     }
        // }
        // for (let y = -4; y < 15; y++) {
        //     if(!this.getForAtBase(STRUCTURE_RAMPART, {x: -4, y: y})) {
        //         let pos = this.toRoomPos({x: -4, y: y});
        //         let code = pos.createConstructionSite(STRUCTURE_RAMPART);
        //         if(code == ERR_FULL) return false;
        //     }
        //     if(!this.getForAtBase(STRUCTURE_RAMPART, {x: 14, y: y})) {
        //         let pos = this.toRoomPos({x: 14, y: y});
        //         let code = pos.createConstructionSite(STRUCTURE_RAMPART);
        //         if(code == ERR_FULL) return false;
        //     }
        // }

        // let room = Game.rooms[this.roomName];
        // if(!room) return false;
        // let controller = room.controller;
        // if(!controller) return false;
        // controller.pos.availableNeighbors(true, true).forEach(pos => {
        //     if(!this.getForAt(STRUCTURE_RAMPART, pos.x, pos.y) && this.judgePosToTheBarrier(pos) != 'inside') pos.createConstructionSite(STRUCTURE_RAMPART);
        // });


        // let structures = structureLayout[this.rcl].buildings;
        // for (const spawnPos of structures.spawn.pos) {
        //     let pos = this.toRoomPos(spawnPos);
        //     if(this.getForAt(STRUCTURE_RAMPART, pos)) continue;
        //     let code = pos.createConstructionSite(STRUCTURE_RAMPART);
        //     if(code != OK) return false;
        // }

        // if(structures.storage.pos.length){
        //     let pos = this.toRoomPos(structures.storage.pos[0]);
        //     if(!this.getForAt(STRUCTURE_RAMPART, pos)){
        //         let code = pos.createConstructionSite(STRUCTURE_RAMPART);
        //         if(code != OK) return false;
        //     }
        // }

        // if(structures.terminal.pos.length){
        //     let pos = this.toRoomPos(structures.terminal.pos[0]);
        //     if(!this.getForAt(STRUCTURE_RAMPART, pos)){
        //         let code = pos.createConstructionSite(STRUCTURE_RAMPART);
        //         if(code != OK) return false;
        //     }
        // }

        return true;
    }

    public clearBuildings(map: CostMatrix) {
        for (const structure of Game.rooms[this.roomName].structures) {
            if ((structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL)
                && map.get(structure.pos.x, structure.pos.y) != MAP_ON) structure.destroy();

            // if(structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) continue;
            // let pos = this.toBasePos(structure.pos);
            // if((pos.x == -1 || pos.x == 11) && (pos.y >= -1 && pos.y <= 3 || pos.y >= 7 && pos.y <= 11)) structure.destroy();
            // if((pos.y == -1 || pos.y == 11) && (pos.x >= -1 && pos.x <= 3 || pos.x >= 7 && pos.x <= 11)) structure.destroy();
        }
    }

    public isLegalRampartOrWall(pos: Coord, type: StructureConstant): boolean {
        if (type == STRUCTURE_RAMPART) {
            let room = Game.rooms[this.roomName];
            if (!room) return false;
            let controller = room.controller;
            if (!controller) return false;
            if (new RoomPosition(pos.x, pos.y, this.roomName).inRangeTo(controller, 1) && this.judgePosToTheBarrier(pos) != 'inside') return true;
        }

        pos = this.toBasePos(pos);
        if (type == STRUCTURE_RAMPART && (pos.x == -4 || pos.x == 14)) return true;
        if (type == STRUCTURE_RAMPART && (pos.y == -4 || pos.y == 14)) return true;
        // if(type == STRUCTURE_WALL && (pos.x == -1 || pos.x == 11) && (pos.y < 4 || pos.y > 6)) return true;
        // if(type == STRUCTURE_WALL && (pos.y == -1 || pos.y == 11) && (pos.x < 4 || pos.x > 6)) return true;

        // if(type == STRUCTURE_RAMPART){
        //     let structures = structureLayout[this.rcl].buildings;
        //     for (const spawnPos of structures.spawn.pos)
        //         if(spawnPos.x == pos.x && spawnPos.y == pos.y) return true;

        //     if(structures.storage.pos.length){
        //         let storagePos = structures.storage.pos[0];
        //         if(storagePos.x == pos.x && storagePos.y == pos.y) return true;
        //     }

        //     if(structures.terminal.pos.length){
        //         let terminalPos = structures.terminal.pos[0];
        //         if(terminalPos.x == pos.x && terminalPos.y == pos.y) return true;
        //     }
        // }
        return false;
    }

    public judgePosToTheBarrier(pos: Coord): 'inside' | 'on' | 'outside' {
        let top = this.basePosition.y - 4;
        let topWidth = 0;
        if (top < 2) {
            top = 2;
            topWidth = 5 - this.basePosition.y;
        }

        let bottom = this.basePosition.y + 14;
        let bottomWidth = 0;
        if (bottom > 47) {
            bottom = 47;
            bottomWidth = this.basePosition.y - 44;
        }

        let left = this.basePosition.x - 4;
        let leftWidth = 0;
        if (left < 2) {
            left = 2;
            leftWidth = 5 - this.basePosition.x;
        }

        let right = this.basePosition.x + 14;
        let rightWidth = 0;
        if (right > 47) {
            right = 47;
            rightWidth = this.basePosition.x - 44;
        }

        if (pos.x > right || pos.x < left || pos.y > bottom || pos.y < top) return 'outside';
        if (pos.x == right || pos.x == left || pos.y == bottom || pos.y == top) return 'on';
        if (pos.x < this.basePosition.x + 11 && pos.x >= this.basePosition.x && pos.y < this.basePosition.y + 11 && pos.y >= this.basePosition.y) {
            if (pos.x < this.basePosition.x + leftWidth || pos.x > this.basePosition.x + rightWidth) return 'on';
            if (pos.y < this.basePosition.y + topWidth || pos.y > this.basePosition.y + bottomWidth) return 'on';
        }
        return 'inside';
    }

    public toRoomPos(pos: Coord): RoomPosition {
        return new RoomPosition(pos.x + this.basePosition.x, pos.y + this.basePosition.y, this.roomName);
    }
    public toBasePos(pos: Coord): Coord {
        return { x: pos.x - this.basePosition.x, y: pos.y - this.basePosition.y };
    }

    public getAtBase(x: number, y: number): StructureInPos;
    public getAtBase(roomPosition: Coord): StructureInPos;

    public getAtBase(x: number | Coord, y?: number): StructureInPos | undefined {
        if (typeof x != 'number') {
            y = x.y;
            x = x.x;
        }
        if (y == undefined) return;
        if (!Memory.stableData[this.roomName]) return;

        let structures = this.getRoomStructures();
        if (!structures) return;

        let pos = Memory.stableData[this.roomName].basePosition;
        return structures.getAt(x + pos.x, y + pos.y);
    }

    public getForAtBase<T extends StructureConstant>(type: T, x: number, y: number): StructureTypes[T] | undefined;
    public getForAtBase<T extends StructureConstant>(type: T, pos: Coord): StructureTypes[T] | undefined;

    public getForAtBase<T extends StructureConstant>(type: T, x: number | Coord,
        y?: number): StructureTypes[T] | undefined {
        if (typeof x != 'number') {
            y = x.y;
            x = x.x;
        }
        if (y == undefined) return;
        if (!Memory.stableData[this.roomName]) return;

        let structures = this.getRoomStructures();
        if (!structures) return;

        let pos = Memory.stableData[this.roomName].basePosition;
        return structures.getAt(x + pos.x, y + pos.y)[type] as any;
    }

    public getAt(x: number, y: number): StructureInPos;
    public getAt(roomPosition: Coord): StructureInPos;

    public getAt(x: number | Coord, y?: number): StructureInPos | undefined {
        if (typeof x != 'number') {
            y = x.y;
            x = x.x;
        }
        if (y == undefined) return;
        if (x < 1 || x > 48 || y < 1 || y > 48) return;

        let structures = this.getRoomStructures();
        if (!structures) return;

        return structures.getAt(x, y);
    }

    public getForAt<T extends StructureConstant>(type: T, x: number, y: number): StructureTypes[T] | undefined;
    public getForAt<T extends StructureConstant>(type: T, pos: Coord): StructureTypes[T] | undefined;

    public getForAt<T extends StructureConstant>(type: T, x: number | Coord, y?: number): StructureTypes[T] | undefined {
        if (typeof x != 'number') {
            y = x.y;
            x = x.x;
        }
        if (y == undefined) return;
        if (x < 1 || x > 48 || y < 1 || y > 48) return;

        let structures = this.getRoomStructures();
        if (!structures) return;

        return structures.getAt(x, y)[type] as any;
    }

    public getRoomStructures(): RoomStructures | undefined {
        if (!RoomPlanner.roomBuiding) RoomPlanner.roomBuiding = {};
        if (RoomPlanner.roomBuiding[this.roomName] && Game.time - RoomPlanner.roomBuiding[this.roomName].time < 5) return RoomPlanner.roomBuiding[this.roomName];

        let room = Game.rooms[this.roomName];
        if (!room) return RoomPlanner.roomBuiding[this.roomName];
        let structures: RoomStructures = new RoomStructures();
        for (const structure of room.find(FIND_STRUCTURES)) {
            structures.setStructure(structure, structure.pos.x, structure.pos.y);
        }

        return RoomPlanner.roomBuiding[this.roomName] = structures;
    }
}
