interface PathfinderReturn {
    path: RoomPosition[];
    ops: number;
    cost: number;
    incomplete: boolean;
}

interface TravelToReturnData {
    nextPos?: RoomPosition;
    pathfinderReturn?: PathfinderReturn;
    state?: TravelState;
    path?: string;
}

interface TravelToOptions {
    ignoreRoads?: boolean;
    ignoreCreeps?: boolean;
    ignoreStructures?: boolean;
    preferHighway?: boolean;
    highwayBias?: number;
    allowHostile?: boolean;
    allowSK?: boolean;
    range?: number;
    obstacles?: {pos: RoomPosition}[];
    roomCallback?: (roomName: string, matrix: CostMatrix) => CostMatrix | boolean;
    routeCallback?: (roomName: string) => number;
    matrix?: CostMatrix;
    // returnData?: TravelToReturnData;
    restrictDistance?: number;
    useFindRoute?: boolean;
    maxOps?: number;
    movingTarget?: boolean;
    freshMatrix?: boolean;
    offRoad?: boolean;
    stuckValue?: number;
    maxRooms?: number;
    repath?: number;
    route?: {[roomName: string]: boolean};
    ensurePath?: boolean;
    pushCreep?: boolean;
}

interface TravelData {
    state: any[];
    path: string;
}

interface TravelState {
    stuckCount: number;
    lastCoord: Coord;
    destination: RoomPosition;
    cpu: number;
}

interface FillingAction {
    structure?: StructureSpawn | StructureExtension;
    pos?: {x: number, y: number}
}

interface Creep {
    travelTo(destination: HasPos|RoomPosition, ops?: TravelToOptions): number;
}

interface PowerCreep {
    travelTo(destination: HasPos|RoomPosition, ops?: TravelToOptions): number;
}

interface StructureTypes{
    extension: StructureExtension;
    rampart: StructureRampart;
    road: StructureRoad;
    spawn: StructureSpawn;
    link: StructureLink;
    constructedWall: StructureWall;
    storage: StructureStorage;
    tower: StructureTower;
    observer: StructureObserver;
    powerSpawn: StructurePowerSpawn;
    extractor: StructureExtractor;
    lab: StructureLab;
    terminal: StructureTerminal;
    container: StructureContainer;
    nuker: StructureNuker;
    factory: StructureFactory;
    invaderCore: StructureInvaderCore;
    keeperLair: StructureKeeperLair;
    controller: StructureController;
    powerBank: StructurePowerBank;
    portal: StructurePortal;
}

type CommoditiesRaw = DepositConstant | MineralConstant | RESOURCE_ENERGY | RESOURCE_GHODIUM;

type Coord = {x: number, y: number};
type HasPos = {pos: RoomPosition}
