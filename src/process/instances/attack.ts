import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { Processes } from "../processes";
import { RoleFactory } from "../../roles/roleFactory";
import { RoleWarrior } from "../../roles/attack/warrior";
import { RoleDestroyer } from "../../roles/attack/destroyer";
import { RoleHealer } from "../../roles/attack/healer";
import { CreepWish } from "../../programs/creepWish";
import { Traveler } from "../../programs/Traveler";
import { ProcessBoost } from "./boost";
import { possibleDamage, possibleTowerDamage, isEqual, toRoomPosition, getRangeTo, hasAggressiveBodyParts } from "../../utils";
import { USER_NAME } from "../../config";
import { ErrorMapper } from "../../utils/ErrorMapper";

const roleToCompounds = {
    'warrior': ['XKHO2', 'XZHO2', 'XGHO2'],//ra: XKHO2 //a: XUH2O //w: XZH2O
    'destroyer': ['XZH2O', 'XZHO2', 'XGHO2'],
    'healer': ['XLHO2', 'XZHO2', 'XGHO2']
};

// export const healerNumPerGroup: number = 1;

export const healerPos: {
    left: {
        up: {[index: number]: Coord},
        down: {[index: number]: Coord}
    },
    right: {
        up: {[index: number]: Coord},
        down: {[index: number]: Coord}
    }
} = {
    left: {
        up: {
            0: {x: 1, y: 0},
            1: {x: 1, y: 1},
            2: {x: 0, y: 1},
        },
        down: {
            0: {x: 1, y: 0},
            1: {x: 1, y: -1},
            2: {x: 0, y: -1},
        }
    },
    right: {
        up: {
            0: {x: -1, y: 0},
            1: {x: 0, y: 1},
            2: {x: -1, y: 1},
        },
        down: {
            0: {x: -1, y: 0},
            1: {x: -1, y: -1},
            2: {x: 0, y: -1},
        }
    }
}

export const dirToAxis: {
    [dir: number]: {x?: 'left' | 'right', y?: 'up' | 'down'}
} = {
    1: {y: 'up'},
    2: {x: 'right', y: 'up'},
    3: {x: 'right'},
    4: {x: 'right', y: 'down'},
    5: {y: 'down'},
    6: {x: 'left', y: 'down'},
    7: {x: 'left',},
    8: {x: 'left', y: 'up'},
}

@profile
export class ProcessAttack extends Process{

    static hitsMatrix: {[roomName: string]: CostMatrix} = {};

    memory: ProcessAttackInterface;

    targetRoom: string;
    boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'} = {};

    adGroupNum: number;
    arGroupNum: number;

    adHealerNum: number;
    arHealerNum: number;

    targetCreeps: (Creep | PowerCreep)[] = [];
    agressiveCreeps: Creep[] = [];

    constructor(roomName: string, targetRoom: string) {
        super(roomName, 'attack');
        this.targetRoom = targetRoom;
    }

    static getInstance(struct: ProcessAttackInterface, roomName: string): ProcessAttack{
        let process = new ProcessAttack(roomName, struct.targetRoom);
        process.boostFlag = struct.boostFlag;
        return process;
    }

    registerCreep(creepName: string) {
        super.registerCreep(creepName);
        this.boostFlag[creepName] = 'none';
        this.memory.boostFlag[creepName] = 'none';
    }
    removeCreep(creepName: string) {
        super.removeCreep(creepName);
        delete this.boostFlag[creepName];
        delete this.memory.boostFlag[creepName];
    }

    run() {
        this.adGroupNum = undefined as any;
        this.arGroupNum = undefined as any;
        this.adHealerNum = undefined as any;
        this.arHealerNum = undefined as any;
        _.forEach(_.filter(Game.flags, flag => 
            flag.pos.roomName == this.targetRoom && flag.name.match(this.roomName)),
            flag => {
                if(flag.name.match('ad')) {
                    let strings = flag.name.split('_');
                    let num = Number.parseInt(strings[2]);
                    if(num >= (this.adGroupNum || 0)) {
                        this.adGroupNum = num;
                        this.adHealerNum = Number.parseInt(strings[3]);
                    }
                } else if(flag.name.match('ar')) {
                    let strings = flag.name.split('_');
                    let num = Number.parseInt(strings[2]);
                    if(num >= (this.arGroupNum || 0)) {
                        this.arGroupNum = num;
                        this.arHealerNum = Number.parseInt(strings[3]);
                    }
                }
            });

        if(this.adGroupNum === undefined && this.arGroupNum === undefined) {
            this.close();
            return;
        }
        
        this.foreachCreep(() => {});
        let creeps = _.groupBy(_.map(this.creeps, creepName => Game.creeps[creepName]), creep => creep.memory.role);
        if(!creeps['warrior']) creeps['warrior'] = [];
        if(!creeps['destroyer']) creeps['destroyer'] = [];
        if(!creeps['healer']) creeps['healer'] = [];
        let warriors = _.map(creeps['warrior'], creep => RoleFactory.getRole(creep, creep => new RoleWarrior(creep)) as RoleWarrior);
        let destroyers = _.map(creeps['destroyer'], creep => RoleFactory.getRole(creep, creep => new RoleDestroyer(creep)) as RoleDestroyer);
        let healers = _.map(creeps['healer'], creep => RoleFactory.getRole(creep, creep => new RoleHealer(creep)) as RoleHealer);

        if(healers.length < (this.adGroupNum || 0) * (this.adHealerNum || 0) + (this.arGroupNum || 0) * (this.arHealerNum || 0)) CreepWish.wishCreep(this.roomName, 'healer', this.fullId);
        if(warriors.length < this.arGroupNum) CreepWish.wishCreep(this.roomName, 'warrior', this.fullId, {healerName: []});
        if(destroyers.length < this.adGroupNum) CreepWish.wishCreep(this.roomName, 'destroyer', this.fullId, {healerName: []});
        // if(healers.length < destroyers.length * (this.adHealerNum || 0) + warriors.length * (this.arHealerNum || 0)) CreepWish.wishCreep(this.roomName, 'healer', this.fullId);
        // console.log(healers.length, destroyers.length * this.adHealerNum, warriors.length * this.arHealerNum);
        // console.log(healers.length < destroyers.length * (this.adHealerNum || 0) + warriors.length * (this.arHealerNum || 0));
        (<(RoleWarrior | RoleDestroyer)[]>[]).concat(destroyers, warriors).forEach(role => {
            if(role.creep.memory.healerName.length < (role instanceof RoleWarrior ? this.arHealerNum : this.adHealerNum) && !role.creep.spawning && this.boostFlag[role.creep.name] == 'boosted') {
                role.creep.notifyWhenAttacked(false);
                let freeHealer = healers.filter(role => !role.creep.memory.healingName && !role.creep.spawning)[0];
                if(freeHealer && this.boostFlag[freeHealer.creep.name] == 'boosted') {
                    freeHealer.creep.notifyWhenAttacked(false);
                    role.creep.memory.healerName.push(freeHealer.creep.name);
                    freeHealer.creep.memory.healingName = role.creep.name;
                }
            }
        });
        
        _.forEach(creeps, (creeps, role) => creeps.forEach(creep => {
            if(!role) return;
            let enough = ProcessBoost.enoughToBoost(this.roomName, roleToCompounds[role], creep);
            // if(!enough) {
            //     console.log(`Process attack: ${this.roomName} compound used up`);
            //     Game.notify(`Process attack: ${this.roomName} compound used up`);
            //     _.forEach(_.filter(Game.flags, flag => flag.pos.roomName == this.targetRoom && (flag.name.match('ar') || flag.name.match('ad'))), flag => flag.remove());
            //     this.close();
            //     return false;
            // }
            if(!creep.spawning && this.boostFlag[creep.name] == 'none' && !Process.getProcess(this.roomName, 'boost')) {
                Processes.processBoost(this.roomName, roleToCompounds[role], creep.name, this.fullId);
                this.boostFlag[creep.name] = 'boosting';
                return;
            }
            return;
        }));

        let targetRoom = this.targetRoom;
        if(Game.flags.t) targetRoom = Game.flags.t.pos.roomName;

        let matrix = ProcessAttack.getHitsMatrix(targetRoom);
        if(matrix) ProcessAttack.hitsMatrix[targetRoom] = matrix;

        // let targetRoom = Game.rooms[this.targetRoom];
        // if(targetRoom) {
        //     this.targetCreeps = targetRoom.find(FIND_HOSTILE_CREEPS);
        //     this.targetCreeps.push(...targetRoom.find(FIND_HOSTILE_POWER_CREEPS));
        //     this.agressiveCreeps = targetRoom.find(FIND_HOSTILE_CREEPS, {filter: creep => hasAggressiveBodyParts(creep, false)});
        // } else {
        //     this.targetCreeps = [];
        //     this.agressiveCreeps = [];
        // }

        warriors.forEach(warrior => this.runCreep(warrior, this.arHealerNum));
        destroyers.forEach(destroyer => this.runCreep(destroyer, this.adHealerNum));
        healers.forEach(healer => this.runCreep(healer));
    }

    runCreep(role: RoleWarrior | RoleDestroyer | RoleHealer, healerNum?: number) {
        if(this.boostFlag[role.creep.name] != 'boosted') return;
        // console.log(role.creep.name);
        role.process = this;
        if(!(role instanceof RoleHealer) && healerNum) role.healerNum = healerNum;
        try {
            role.run();
        } catch (error) {
            if(!error.stack) 
                throw error;
            console.log(`<span style='color:red'>${_.escape(ErrorMapper.sourceMappedStackTrace(error))}</span>`);
        }
        if(role instanceof RoleHealer) role.moved = false;
    }

    boostedCreep(creepName: string) {
        this.boostFlag[creepName] = 'boosted';
        this.memory.boostFlag[creepName] = 'boosted';
    }

    static getHitsMatrix(roomName: string): CostMatrix | undefined {
        let room = Game.rooms[roomName];
        if(!room) return;

        let obstacles: (StructureRampart | StructureWall)[] = [];
        obstacles.push(...room.ramparts);
        obstacles.push(...room.constructedWalls);
        let minHits = _.min(obstacles, ob => ob.hits).hits;
        let maxHits = _.max(obstacles, ob => ob.hits).hits;

        let matrix = new PathFinder.CostMatrix();
        Traveler.addStructuresToMatrix(room, matrix, 1, 5);
        _.forEach(obstacles, ob => {
            matrix.set(ob.pos.x, ob.pos.y, matrix.get(ob.pos.x, ob.pos.y) + 50 + Math.floor(((ob.hits - minHits) / ((maxHits - minHits) || Infinity)) * 150));
        });
        
        return matrix;
    }

    getTargets(pos: RoomPosition, creep?: boolean): (AnyStructure | Creep | ConstructionSite)[] {
        let room = Game.rooms[this.targetRoom];
        if(!room) return [];
        // if(room.extensions.filter(structure => !structure.my).length) return room.extensions.filter(structure => !structure.my);
        // if(room.terminal && !room.terminal.my) return [room.terminal];
        let easyTargets = room.structures.filter(structure => !structure.pos.lookForStructure(STRUCTURE_RAMPART) && 
            structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && 
            structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTAINER && structure.structureType != STRUCTURE_CONTROLLER && 
            structure.structureType != STRUCTURE_KEEPER_LAIR && structure.structureType != STRUCTURE_EXTRACTOR && structure.structureType != STRUCTURE_PORTAL
            && structure.structureType != STRUCTURE_POWER_BANK && structure.structureType != STRUCTURE_LINK && !structure.my);
        if(easyTargets.length) return easyTargets;
        if(room.spawns.filter(structure => !structure.my).length) return room.spawns.filter(structure => !structure.my);
        if(room.towers.filter(structure => !structure.my).length) return room.towers.filter(structure => !structure.my);
        if(room.terminal && !room.terminal.my) return [room.terminal];
        if(room.storage && !room.storage.my) return [room.storage];
        if(room.nuker && !room.nuker.my) return [room.nuker];
        if(room.invaderCore) return [room.invaderCore];
        if(room.extensions.filter(structure => !structure.my).length) return room.extensions.filter(structure => !structure.my);
        let targets = room.structures.filter(structure => structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART && 
            structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTAINER && structure.structureType != STRUCTURE_CONTROLLER && 
            structure.structureType != STRUCTURE_KEEPER_LAIR && structure.structureType != STRUCTURE_EXTRACTOR && structure.structureType != STRUCTURE_PORTAL 
            && structure.structureType != STRUCTURE_POWER_BANK&& !structure.my);
        let hostle = room.find(FIND_HOSTILE_CREEPS);
        if(targets.length) return targets;
        else if(creep && hostle.length) return hostle;
        else return room.find(FIND_CONSTRUCTION_SITES);
        return [];
    }

    close() {
        let close = true;
        // this.foreachCreep(creep => {
        //     if(creep.spawning) close = false;
        //     creep.suicide()
        // });
        if(close) super.close();
        return;
    }

    getStruct(): ProcessAttackInterface{
        return _.merge(super.getStruct(), {boostFlag: this.boostFlag, targetRoom: this.targetRoom});
    }

    travelTo_(role: RoleWarrior|RoleDestroyer, target: HasPos|RoomPosition, followers: {creep: Creep, go(dir: DirectionConstant)}[], range: number) {
        let cpu = Game.cpu.getUsed();
        let creep = role.creep;
        let dir = Traveler.getNextDir(creep);
        if(dir == -1) {
            creep.travelTo(target, {range: range});
            return;
        }

        if(!role.axis) role.axis = dirToAxis[dir];
        else _.merge(role.axis, dirToAxis[dir]);


    }

    isStandable(pos: RoomPosition, poses: {[index: number]: Coord}, followers: {creep: Creep, go(dir: DirectionConstant)}[]) {
        let result = true;
        _.forEach(poses, p => {
            if(_.some(pos.lookFor(LOOK_CREEPS), creep => !_.some(followers, follower => follower.creep.name == creep.name))) {
                result = false;
                return false;
            }
            return true;
        });
        return result;
    }

    travelTo(creep: Creep, target: HasPos|RoomPosition, followers: {creep: Creep, go(dir: DirectionConstant)}[], range: number) {
        let cpu = Game.cpu.getUsed();
        let dir = Traveler.getNextDir(creep);
        if(dir == -1) {
            creep.travelTo(target, {range: range});
            return;
        }

        let poses = this.getStandablePoses(creep.room, creep.pos, creep.body, dir, followers, creep.room.name != this.roomName);
        if(poses.length < followers.length) {
            creep.travelTo(target, {range: range});
            return;
        }
        poses.forEach(pos => new RoomVisual(creep.room.name).circle(pos, {fill: '#8A2BE2'}));
        if(!_.some(poses, pos => pos.lookFor(LOOK_CREEPS).length == 0)) {
            this.followersGo(followers, dir);
            creep.travelTo(target, {range: range, pushCreep: false});
            return;
        }

        let minCoord = {x: Infinity, y: Infinity};
        let maxCoord = {x: 0, y: 0};
        for (const pos of poses) {
            if(pos.x < minCoord.x) minCoord.x = pos.x;
            if(pos.y < minCoord.y) minCoord.y = pos.y;
            if(pos.x > maxCoord.x) maxCoord.x = pos.x;
            if(pos.y > maxCoord.y) maxCoord.y = pos.y;
        }
        for (const follower of followers) {
            if(follower.creep.pos.x < minCoord.x) minCoord.x = follower.creep.pos.x;
            if(follower.creep.pos.y < minCoord.y) minCoord.y = follower.creep.pos.y;
            if(follower.creep.pos.x > maxCoord.x) maxCoord.x = follower.creep.pos.x;
            if(follower.creep.pos.y > maxCoord.y) maxCoord.y = follower.creep.pos.y;
        }
        if(creep.pos.x < minCoord.x) minCoord.x = creep.pos.x;
        if(creep.pos.y < minCoord.y) minCoord.y = creep.pos.y;
        if(creep.pos.x > maxCoord.x) maxCoord.x = creep.pos.x;
        if(creep.pos.y > maxCoord.y) maxCoord.y = creep.pos.y;
        let matrix = new BFSMatrix(minCoord, maxCoord);
        Traveler.addStructuresToMatrix(creep.room, matrix as any, BLANK);
        // for (let x = 0; x < 49; x++) {
        //     for (let y = 0; y < 49; y++) {
        //         if(x < minCoord.x || y < minCoord.y || x > maxCoord.x || y > maxCoord.y) matrix.set(x, y, WALL);
        //     }
        // }
        // let matrix = new BFSMatrix(minCoord, maxCoord);
        // Traveler.addStructuresToMatrix(creep.room, matrix as any, 1);
        let terrain = Game.map.getRoomTerrain(creep.room.name);
        matrix.set(creep.pos.x, creep.pos.y, WALL);
        for (let x = minCoord.x; x <= maxCoord.x; x++) {
            for (let y = minCoord.y; y <= maxCoord.y; y++) {
                if(terrain.get(x, y) == TERRAIN_MASK_WALL) matrix.set(x, y, WALL);
                let pos = new RoomPosition(x, y, creep.room.name);
                if(pos.lookFor(LOOK_CREEPS).length) 
                    matrix.set(x, y, WALL);
            }
        }
        // _.forEach(followers, follower => matrix.set(follower.creep.pos.x, follower.creep.pos.y, follower.creep.name))
        matrix.display(creep.room.name);

        let state = new BFSState();
        state.matrix = matrix;
        _.forEach(followers, follower => {
            state.state[follower.creep.name] = {pos: follower.creep.pos, walkedPos: [follower.creep.pos]};
        });
        let result = this.BFS([state], poses, 0);
        // creep.travelTo(target, {range: range});
        console.log('complete', result.complete);
        if(result.complete) {
            _.forEach(followers, follower => {
                let pos = result.creepPoses[follower.creep.name];
                console.log(follower.creep.name, JSON.stringify(pos));
                if(pos) follower.go(follower.creep.pos.getDirectionTo(toRoomPosition(pos, creep.room.name)));
            })
        } 
        else creep.travelTo(target, {range: range});
        console.log('used', Game.cpu.getUsed() - cpu)
    }

    getStandablePoses(room: Room, pos: RoomPosition, body: BodyPartDefinition[], dir: DirectionConstant, followers: {creep: Creep, go(dir: DirectionConstant)}[], towerDamage: boolean): RoomPosition[]{
        let poses = pos.availableNeighbors(true)
            .filter(pos => !pos.isEdge && !_.some(pos.lookFor(LOOK_CREEPS), creep => !_.some(followers, follower => follower.creep.name == creep.name)))
            .sort((a, b) => {
                let da = possibleDamage(body, a, USER_NAME, false, towerDamage ? possibleTowerDamage(room, a) : 0);
                let db = possibleDamage(body, b, USER_NAME, false, towerDamage ? possibleTowerDamage(room, b) : 0);
                if(da == db) {
                    let dira = pos.getDirectionTo(a);
                    let dirb = pos.getDirectionTo(b);
                    return Traveler.comDirs(dir, dirb) - Traveler.comDirs(dir, dira);
                }
                return possibleDamage(body, a, USER_NAME, false, towerDamage ? possibleTowerDamage(room, a) : 0) 
                            - possibleDamage(body, b, USER_NAME, false, towerDamage ? possibleTowerDamage(room, b) : 0)
                        })
            .slice(0, followers.length);
        return poses;
    }

    /**
     * 
     * @param state {
            let dir2 = pushee.pos.getDirectionTo(pos);
            let d = Math.abs(dir2 - dir);
            return d > 4 ? 8 - d : d;
        }
     * @param targets 
     * @param matrix 
     */

    gotoStandablePoses(state: BFSState, targets: RoomPosition[], matrix: BFSMatrix): BFSResult{
        while (true) {
            let finished = true;
            let failed = false;
            _.forEach(targets, target => {
                if(matrix.hasCreep(target.x, target.y)) return;
                else finished = false;
                let creeps = state.getAvailableNeighborCreeps(target);
                console.log(creeps.length);
                if(!creeps.length) {
                    failed = true;
                    return false;
                }
                let creep = creeps[Math.floor(Math.random() * creeps.length)];
                state.visit(creep, target);
                return;
            });
            if(finished) {
                let result = new BFSResult(0, true);
                _.forEach(state.state, (state, creepName) => {
                    if(!creepName) return;
                    let fpos = state.walkedPos[0];
                    _.forEach(state.walkedPos, pos => {
                        if(getRangeTo(fpos, pos) <= 1) fpos = pos;
                        else return false;
                        return;
                    })
                    result.creepPoses[creepName] = fpos;
                    // if(state.walkedPos[1]) result.creepPoses[creepName] = state.walkedPos[1];
                });
                return result;
            }
            if(failed) return new BFSResult(0, false);
        }
    }

    search(followers: {creep: Creep, go(dir: DirectionConstant)}[], targets: RoomPosition[], matrix: BFSMatrix): BFSResult{
        let pathResults: {creepName: string, paths: RoomPosition[][]}[] = [];
        let complete = true;
        _.forEach(followers, follower => {
            let paths:RoomPosition[][] = [];
            _.forEach(targets, target => {
                let searchResult = PathFinder.search(follower.creep.pos, target, {maxRooms: 1, roomCallback: roomName => matrix as any});
                if(searchResult.incomplete) complete = false;
                // console.log(searchResult.cost);
                paths.push(searchResult.path);
            });
            pathResults.push({creepName: follower.creep.name, paths: paths.sort((a, b) => a.length - b.length)});
        });
        if(!complete) {
            return new BFSResult(0, false);
        }
        pathResults.sort((a, b) => _.min(b.paths.map(path => path.length)) - _.min(a.paths.map(path => path.length)));
        let result = new BFSResult(0, true);
        console.log(JSON.stringify(pathResults, undefined, 4))

        for (let index = 0; index < pathResults.length; index++) {
            const r = pathResults[index];
            if(r.paths[index][0]) result.creepPoses[r.creepName] = r.paths[index][0];
        }


        // let usedTarget: number[] = [];

        // for (let index = 0; index < pathResults.length; index++) {
        //     const r = pathResults[0];
        //     console.log(r.paths.length);
        //     let minIndex: number = 0;
        //     let minPath: RoomPosition[] = [];
        //     let minLength: number = Infinity;
        //     for (let i = 0; i < r.paths.length; i++) {
        //         const path = r.paths[i];
        //         // if(_.contains(usedTarget, i)) continue;
        //         if(path.length < minLength) {
        //             minIndex = i;
        //             minPath = path;
        //             minLength = path.length;
        //         }
        //     }
        //     _.forEach(pathResults, (paths, i) => {
        //         if(i !== undefined && i === minIndex) paths.paths.splice(i);
        //     });
        //     pathResults.splice(0);
        //     pathResults.sort((a, b) => _.min(b.paths.map(path => path.length)) - _.min(a.paths.map(path => path.length)));
        //     // usedTarget.push(minIndex);
        //     if(minPath[0]) result.creepPoses[r.creepName] = minPath[0];
        // }

        // _.forEach(pathResults, r => {
        //     // _.remove(r.paths, (path, i) => _.contains(usedTarget, i));
        //     console.log(r.paths.length);
        //     let minIndex: number = 0;
        //     let minPath: RoomPosition[] = [];
        //     let minLength: number = Infinity;
        //     for (let i = 0; i < r.paths.length; i++) {
        //         const path = r.paths[i];
        //         // if(_.contains(usedTarget, i)) continue;
        //         if(path.length < minLength) {
        //             minIndex = i;
        //             minPath = path;
        //             minLength = path.length;
        //         }
        //     }
        //     _.forEach(pathResults, (paths, i) => {
        //         if(i !== undefined && i === minIndex) paths.paths.splice(i);
        //     });
        //     pathResults.sort((a, b) => _.min(b.paths.map(path => path.length)) - _.min(a.paths.map(path => path.length)));
        //     // usedTarget.push(minIndex);
        //     if(minPath[0]) result.creepPoses[r.creepName] = minPath[0];
        // });
        return result;
    }

    BFS(states: BFSState[], targets: Coord[], depth: number): BFSResult{
        console.log('depth', depth, 'states', states.length);
        let complete = false;
        let finalResult: any = {};
        _.forEach(states, state => {
            if(_.some(targets, target => !_.some(state.state, state => isEqual(state.pos, target)))) return;
            console.log('search succeed', 'depth', depth);
            complete = true;
            let result = new BFSResult(depth, true);
            _.forEach(state.state, (state, creepName) => {
                if(!creepName) return;
                // if(creepName == 'healer_2') console.log(JSON.stringify(state.walkedPos))
                let fpos = state.walkedPos[0];
                _.forEach(state.walkedPos, pos => {
                    if(getRangeTo(state.walkedPos[0], pos) <= 1) fpos = pos;
                    else return false;
                    return;
                })
                result.creepPoses[creepName] = fpos;
                // if(state.walkedPos[1]) result.creepPoses[creepName] = state.walkedPos[1];
            });
            finalResult = result;
        });
        if(complete) return finalResult;
        if(states.length > 300) return new BFSResult(depth, false);

        let newStates: BFSState[] = [];
        // let totalDirs: {creepName: string, pos: Coord}[] = [];
        _.forEach(states, state => {
            let dirs: {creepName: string, pos: Coord}[] = [];
            _.forEach(state.state, (s, creepName) => {
                if(!creepName) return;
                let nowSum = _.sum(targets, target => getRangeTo(target, s.pos));
                // console.log(nowSum);
                if(depth > 2) {
                    _.forEach(state.passibleNeighbors(creepName)
                        .filter(pos => _.sum(targets, target => getRangeTo(target, pos)) < nowSum), pos => dirs.push({creepName: creepName, pos: pos}));
                } else {
                    _.forEach(state.passibleNeighbors(creepName)
                        .filter(pos => _.sum(targets, target => getRangeTo(target, pos)) <= nowSum), pos => dirs.push({creepName: creepName, pos: pos}));
                }
            });
            // console.log('depth', depth, 'dirs', dirs.length);
            if(dirs.length) {
                newStates.push(..._.map(dirs, dir => state.visit(dir.creepName, dir.pos)));
            }
        });
        if(!states.length) return new BFSResult(depth, false);
        return this.BFS(newStates, targets, depth + 1);

        // let result = new BFSResult(Infinity, false);
        // let states = _.map(dirs, dir => state.visit(dir.creepName, dir.pos));
        // states.sort((a, b) => {
        //     // console.log(_.countBy(a.state, s => _.some(targets, target => isEqual(target, s.pos)))['true']);
        //     return _.countBy(b.state, s => _.some(targets, target => isEqual(target, s.pos)))['true'] || 0 -
        //     _.countBy(a.state, s => _.some(targets, target => isEqual(target, s.pos)))['true'] || 0
        // })
        // console.log(_.countBy(states[0].state, s => _.some(targets, target => isEqual(target, s.pos)))['true']);
        // for (const state of states) {
        //     // let sss = state.visit(dir.creepName, dir.pos);
        //     let r = this.BFS(state, targets, depth + 1);
        //     if(r.complete && r.depth < result.depth) {
        //         result = r;
        //         return result;
        //     }
        //     // _.forEach(sss.state, s => s.walkedPos.forEach(pos => console.log(pos.x, pos.y)));
        //     // sss.matrix.display('E5S1');
        //     // console.log(sss.passibleNeighbors('healer_0').length)
        //     // return new BFSResult(depth, false);
        // }
        // return result;
    }

    followersGo(followers: {creep: Creep, go(dir: DirectionConstant)}[], dir: DirectionConstant) {
        _.forEach(followers, follower => follower.go(dir));
    }
}

class BFSResult{
    creepPoses: {[creepName: string]: Coord} = {};
    complete: boolean;
    depth: number;

    constructor(depth: number, complete: boolean) {
        this.depth = depth;
        this.complete = complete;
    }
}

class BFSState{
    matrix: BFSMatrix;
    state: { 
        [creepName: string]: {
            pos: Coord,
            walkedPos: Coord[];
        }
    } = {};

    copy(): BFSState {
        let state = new BFSState();
        state.matrix = this.matrix.clone();
        _.forEach(this.state, (s, creepName) => {
            if(!creepName) return;
            state.state[creepName] = {pos: s.pos, walkedPos: Array.from(s.walkedPos)};
        })
        return state;
    }

    visit(creepName: string, pos: Coord): BFSState{
        let copy = this.copy();
        let originPos = copy.state[creepName].pos;
        copy.matrix.set(originPos.x, originPos.y, BLANK);
        copy.matrix.set(pos.x, pos.y, WALL);
        copy.state[creepName].pos = pos;
        copy.state[creepName].walkedPos.push(pos);
        // console.log(copy.state[creepName].walkedPos.length);
        return copy;
    }

    passibleNeighbors(creepName: string): Coord[]{
        let walkedPos = this.state[creepName].walkedPos;
        let pos = this.state[creepName].pos;
        let adjPos: Coord[] = [];
        for (let dx of [-1, 0, 1]) {
            for (let dy of [-1, 0, 1]) {
                if (!(dx == 0 && dy == 0)) {
                    let x = pos.x + dx;
                    let y = pos.y + dy;
                    if (this.matrix.inTheMatrix(x, y) && this.matrix.get(x, y) == BLANK 
                        && !_.some(walkedPos, pos => isEqual(pos, {x: x, y: y}))) {
                        adjPos.push({x: x, y: y});
                    }
                }
            }
        }
        // console.log(adjPos.length);
        return adjPos;
    }

    getAvailableNeighborCreeps(pos: Coord): string[]{
        console.log(pos);
        let result: string[] = [];
        for (let dx of [-1, 0, 1]) {
            for (let dy of [-1, 0, 1]) {
                if (!(dx == 0 && dy == 0)) {
                    let x = pos.x + dx;
                    let y = pos.y + dy;
                    let value = this.matrix.get(x, y);
                    if(value == WALL || value == BLANK) continue;
                    console.log(value);
                    let walkedPos = this.state[value].walkedPos;
                    if (this.matrix.inTheMatrix(x, y) && !_.some(walkedPos, p => isEqual(p, pos))) {
                        result.push(value + '');
                    }
                }
            }
        }
        return result;
    }
}

const BLANK = 0;
const WALL = 1;
// const WALKED = 2;

class BFSMatrix{
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;

    content: {[index: string]: number} = {};

    constructor(min: Coord, max: Coord) {
        this.xMin = min.x;
        this.yMin = min.y;
        this.xMax = max.x;
        this.yMax = max.y;
    }

    set(x: number, y: number, value: number) {
        if(!this.inTheMatrix(x, y)) return;
        this.content[x + ':' + y] = value;
    }
    get(x: number, y: number): number{
        // console.log('get', x, y);
        if(!this.inTheMatrix(x, y)) return WALL;
        // console.log('value', this.content[x + ':' + y] || 0)
        return this.content[x + ':' + y] || BLANK;
    }

    inTheMatrix(x: number, y: number): boolean{
        if(x < this.xMin || y < this.yMin || x > this.xMax || y > this.yMax) return false;
        return true;
    }

    hasCreep(x: number, y: number): boolean{
        if(!this.inTheMatrix(x, y)) return false;
        return this.get(x, y) != BLANK && this.get(x, y) != WALL;
    }

    clone(): BFSMatrix{
        let matrix = new BFSMatrix({x: this.xMin, y: this.yMin}, {x: this.xMax, y: this.yMax});
        matrix.content = _.clone(this.content);
        return matrix;
    }

    display(roomName: string) {
        for (let x = this.xMin; x <= this.xMax; x++) {
            for (let y = this.yMin; y <= this.yMax; y++) {
                new RoomVisual(roomName).text(this.get(x, y) + '', new RoomPosition(x, y, roomName));
            }
            
        }
    }
}