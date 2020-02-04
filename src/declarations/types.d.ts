// example declaration file - remove these and add your own custom typings

// memory extension samples
interface CreepMemory {
	_trav: TravelData;
	_travel: TravelData;
	id: number;
	roomId: number;
	role: string;
	spawnRoom: string;
	working: boolean;
	sourceTarget: Id;

	target: Id;
	targetIndex: number;
	sleep: boolean;

	building: boolean;

	upgrading: boolean;

	linkId: Id;
	containerId: Id;
	sourceId: Id;
	allotUnit: any; //AllotUnit
	mode: 'n' | 'c' | 'l';

	attack: boolean;

	healerName: string[];
	healingName: string;

	controller: Id;
	targetRoom: string;
	dis: number;

	stage: number;

	state: 'none' | 'link' | 'ps' | 'deal' | 'nuker' | 'tower' | 'carry' | 'balance' | 'correct' | 'boost' | 'factory' | 'lab' | 'labE';
}

interface PowerCreepMemory {
	_trav: any;
	_travel: TravelData;

	lastEnergy: number;
}

interface Memory {
	empire: any;
	day: number;
	colonies: { [name: string]: colonyConfig[] };
	market: { [name: string]: marketConfig };
	attack: { toughId: Id };
	statistics: { 
		[name: string]: statisticsData;
	};
	settings: {
		enableVisuals: boolean;
	};
	rooms: {
		[name: string]: RoomMemory;
	}
	stableData: {
		[roomName: string]: RoomStableMemory;
	}
	processes: {
        [roomName: string]: ProcessInterface[];
	}
	industry: {
		[roomName: string]: {
			type: CommodityConstant;
			amount: number;
			preparing: boolean;
			producing: boolean;
		}
	}
	lastCredit: number;
	avgCredit: number;
	lastTickCredits: number;
	lastChangeCredits: number;
	changeCredits: number;

	poorRoom: string;

	gotoHaul: boolean;
	haulerRoom: string;
	
	UnderAttacking: boolean;

	gotoDismantle: boolean;
	dismantlerRoom: string;

	spawnRoom: string;
	expandRoom: string;
	claimed: boolean;
}

interface FlagMemory { }
interface RoomMemory {
	allot: { [type: number]: any[]; } //allot: { [type: number]: allotUnit[]; }
	isClaimed: boolean;
	avoid: number;

	underAttacking: boolean;
	timeLeft: number;

	storedEnergy: number;
	lowEnergy: boolean;
	noEnergyAvailable: boolean;
	storage: Id;
	centerLink: Id;
	upgradeLink: Id;
	mineral: { type: ResourceConstant, mineralId: Id, extractorId: Id, containerId: Id, distance: number };

	repairCountDown: number;
}

// interface ProcessInterface{
//     roomName: string;
// 	processName: string;
// 	_state: 'sleeping' | 'active' | 'suspended';
// 	_sleepTime: number;
// 	id: number;
// 	creeps: string[];
// }

interface ProcessInterface{
    name: string;
    state: 'sleeping' | 'active' | 'suspended';
	slt: number;
	creeps: string[];
}
type ProcessDefendInterface = ProcessInterface & {
	tgt: string,
	type: 'creep' | 'coreDis'
}
type ProcessMineDepositInterface = ProcessInterface & {
	tgt: string,
	type: DepositConstant
}
type ProcessMinePowerInterface = ProcessInterface & {
	tgt: string
}
type ProcessBoostInterface = ProcessInterface & {
	ct: MineralBoostConstant[],
	creep: string,
	boostState: 'waiting' | 'filling' | 'boosting' | 'withdrawing' | 'done',
	processId: string
}
type ProcessRepairInterface = ProcessInterface & {
	boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'};
	type: 'normal' | 'defend';
	closing: boolean;
	suspending: boolean;
}
type ProcessActiveDefendInterface = ProcessInterface & {
	boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'};
}
type ProcessAttackInterface = ProcessInterface & {
	targetRoom: string;
	boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'};
}
type ProcessAttackRangeInterface = ProcessInterface & {
	targetRoom: string;
	boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'};
}
type ProcessAttackDestroyInterface = ProcessInterface & {
	targetRoom: string;
	boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'};
}
type ProcessAttackControllerInterface = ProcessInterface & {
	targetRoom: string;
	creepNum: number;
}

interface RoomStableMemory {
	finished: boolean;

	basePosition: { x: number, y: number };
	harvesterPosition: {
		0: RoomPosition;
		1: RoomPosition;
	}
	linkPosition: {
		u: RoomPosition;
		h0: RoomPosition;
		h1: RoomPosition;
	}
	containerPosition: {
		m: RoomPosition;
		h0: RoomPosition;
		h1: RoomPosition;
	}

	harvesterPath: {
		0: savedPath;
		1: savedPath;
	}
	mineralPath: savedPath;
	controllerPath: savedPath;
}
interface SpawnMemory { }

interface savedPath{
	paths: pathSeg[];
	dis: number;
}

interface pathSeg{
	pos: RoomPosition;
	path: string;
}

// `global` extension samples
declare namespace NodeJS {
	interface Global {
		log: any;
		rooms:{
			[roomName: string]: {
				workerNum: number | undefined;
			}
		}
		cacheOrders: {
			buy: { [roomName: string]: Order[] }
			sell: { [roomName: string]: Order[] }
		}

		lastMemoryTick: number;
		LastMemory: any;
		Memory: any;
	}
}
interface statisticsData{
	fillerIdleRecord: boolean[];
	resourceUsageRecord: number[];
	idleTickPercent: number;
	averageResourceUsage: number;
	averageResourceUsage_e: number;
	lastReserve: number;
	averageParseCost: number;
}
interface colonyConfig {
	name: string;
	controller: Id;
	enable: boolean;
}
interface marketConfig {
	sellOrder: string;
	sellAmount: number;
	sellPrice: number;
	buyOrder: string;
	buyAmount: number;
	buyPrice: number;
	transport: { des: string, amount: number, type: ResourceConstant };

	orderFinished:{
		buy: {
			order: Order,
			amount: number,
			time: number,
		},
		sell: {
			order: Order,
			amount: number,
			time: number,
		}
	}
}