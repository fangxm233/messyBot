import { profile } from "../profiler/decorator";
import { Visualizer } from "../programs/Visualizer";
import { Traveler } from "../programs/Traveler";
import { RoomPlanner } from "./RoomPlanner";
import { Process } from "../process/process";
import { Porcesses } from "../process/processes";

export const MAP_NONE = 0;
export const MAP_OUTSIDE = 200;
export const MAP_INSIDE = 2;
export const MAP_WALL = 255;
export const MAP_ON = 1;

@profile
export class BarrierPlanner{
    roomName: string;
    basePosition: Coord;
    barrierMap: CostMatrix;
    ramparts: Coord[];

    constructor(roomName: string) {
        this.barrierMap = new PathFinder.CostMatrix();
        this.ramparts = [];
        this.roomName = roomName;
        if(Memory.stableData[roomName])
            this.basePosition = Memory.stableData[roomName].basePosition;
    }

    planRoomBarrier(): Coord[] {
        let room = Game.rooms[this.roomName];
        if(!room) return [];
        this.copyWallsToMap(this.barrierMap);
        this.addOriginalRampart(this.barrierMap);
        this.BFS(this.barrierMap, this.basePosition.x, this.basePosition.y, MAP_INSIDE);
        room.find(FIND_EXIT).forEach(pos => this.BFS(this.barrierMap, pos.x, pos.y, MAP_OUTSIDE));
        this.reduceRamparts(this.barrierMap);
        this.coverDangeriousBaseBuildings(this.barrierMap);
        return this.ramparts;
    }

    private copyWallsToMap(map: CostMatrix) {
        let terrain = Game.map.getRoomTerrain(this.roomName);

        for (let y = 0; y < 50; ++y) {
			for (let x = 0; x < 50; ++x) {
                if(terrain.get(x, y) == TERRAIN_MASK_WALL)
                    map.set(x, y, MAP_WALL);
			}
        }
    }

    private addOriginalRampart(map: CostMatrix) {
        let terrain = Game.map.getRoomTerrain(this.roomName);

        let top = this.basePosition.y - 4;
        if(top < 2) top = 2;

        let bottom = this.basePosition.y + 14;
        if(bottom > 47) bottom = 47;

        let left = this.basePosition.x - 4;
        if(left < 2) left = 2;

        let right = this.basePosition.x + 14;
        if(right > 47) right = 47;

        for (let y = top; y < bottom + 1; y++) {
            if(terrain.get(left, y) != TERRAIN_MASK_WALL) this.setMap(map, left, y, MAP_ON);
            if(terrain.get(right, y) != TERRAIN_MASK_WALL) this.setMap(map, right, y, MAP_ON);
        }
        for (let x = left; x < right + 1; x++) {
            if(terrain.get(x, top) != TERRAIN_MASK_WALL) this.setMap(map, x, top, MAP_ON);
            if(terrain.get(x, bottom) != TERRAIN_MASK_WALL) this.setMap(map, x, bottom, MAP_ON);
        }
    }

    private setMap(map: CostMatrix, x: number, y: number, value: number) {
        if(map.get(x, y) == MAP_ON) {
            if(value == MAP_ON) return;
            _.remove(this.ramparts, coord => coord.x == x && coord.y == y);
        }
        if(value == MAP_ON) this.ramparts.push({x: x, y: y});
        map.set(x, y, value);
    }

    private BFS(map: CostMatrix, x: number, y: number, value: number) {
        this.setMap(map, x, y, value);

        let offsetX = [0, 1, 1, 1, 0, -1, -1, -1];
        let offsetY = [-1, -1, 0, 1, 1, 1, 0, -1];

        for (let u = 0; u < 8; u++) {
            if(this.isValid(map, x + offsetX[u], y + offsetY[u])) {
                this.BFS(map, x + offsetX[u], y + offsetY[u], value);
            }
        }
    }

    private isValid(map: CostMatrix, x: number, y: number): boolean{
        if(x > 49 || x < 0 || y > 49 || y < 0) return false;
        return map.get(x, y) == MAP_NONE;
    }

    private reduceRamparts(map: CostMatrix) {
        let rampartsToRemove: Coord[] = [];

        this.ramparts.forEach(coord => {
            if(!this.getNeibours(coord).map(coord => map.get(coord.x, coord.y)).includes(MAP_OUTSIDE)) rampartsToRemove.push(coord);
        })
        rampartsToRemove.forEach(coord => this.BFS(map, coord.x, coord.y, MAP_INSIDE));
        rampartsToRemove = [];

        this.ramparts.forEach(coord => {
            if(!this.getNeibours(coord).map(coord => map.get(coord.x, coord.y)).includes(MAP_INSIDE)) rampartsToRemove.push(coord);
        })
        rampartsToRemove.forEach(coord => this.BFS(map, coord.x, coord.y, MAP_OUTSIDE));
    }

    private getNeibours(coord: Coord): Coord[]{
        let neibours: Coord[] = [];

        let offsetX = [0, 1, 1, 1, 0, -1, -1, -1];
        let offsetY = [-1, -1, 0, 1, 1, 1, 0, -1];

        for (let u = 0; u < 8; u++) {
            neibours.push({x: coord.x + offsetX[u], y: coord.y + offsetY[u]});
        }

        return neibours;
    }

    private coverDangeriousBaseBuildings(map: CostMatrix) {
        for (let y = this.basePosition.y; y < this.basePosition.y + 11; y++) {
            if(this.isDangerious(map, this.basePosition.x - 1, y)) this.setMap(map, this.basePosition.x - 1, y, MAP_ON);
            if(this.isDangerious(map, this.basePosition.x, y)) this.setMap(map, this.basePosition.x, y, MAP_ON);
            if(this.isDangerious(map, this.basePosition.x + 1, y)) this.setMap(map, this.basePosition.x + 1, y, MAP_ON);
            if(this.isDangerious(map, this.basePosition.x + 9, y)) this.setMap(map, this.basePosition.x + 9, y, MAP_ON);
            if(this.isDangerious(map, this.basePosition.x + 10, y)) this.setMap(map, this.basePosition.x + 10, y, MAP_ON);
            if(this.isDangerious(map, this.basePosition.x + 11, y)) this.setMap(map, this.basePosition.x + 11, y, MAP_ON);
        }
        for (let x = this.basePosition.x; x < this.basePosition.x + 11; x++) {
            if(this.isDangerious(map, x, this.basePosition.y - 1)) this.setMap(map, x, this.basePosition.y - 1, MAP_ON);
            if(this.isDangerious(map, x, this.basePosition.y)) this.setMap(map, x, this.basePosition.y, MAP_ON);
            if(this.isDangerious(map, x, this.basePosition.y + 1)) this.setMap(map, x, this.basePosition.y + 1, MAP_ON);
            if(this.isDangerious(map, x, this.basePosition.y + 9)) this.setMap(map, x, this.basePosition.y + 9, MAP_ON);
            if(this.isDangerious(map, x, this.basePosition.y + 10)) this.setMap(map, x, this.basePosition.y + 10, MAP_ON);
            if(this.isDangerious(map, x, this.basePosition.y + 11)) this.setMap(map, x, this.basePosition.y + 11, MAP_ON);
        }

        let room = Game.rooms[this.roomName];
        if(!room) return;

        let nukes = room.find(FIND_NUKES);
        if(nukes.length) {
            console.log('hi')
            if(!Process.getProcess(this.roomName, 'defendNuke')) Porcesses.processDefendNuke(this.roomName);
            let extensionCount = room.extensions.length;
            let rp = new RoomPlanner(this.roomName);
    
            nukes.forEach(nuke => {
                for (let x = nuke.pos.x - 2; x <= nuke.pos.x + 2; x++) {
                    for (let y = nuke.pos.y - 2; y <= nuke.pos.y + 2; y++) {
                        let structures = rp.getAt(x, y);
                        if(structures[STRUCTURE_SPAWN] || structures[STRUCTURE_POWER_SPAWN] || structures[STRUCTURE_STORAGE] || structures[STRUCTURE_TERMINAL] ||
                            structures[STRUCTURE_NUKER] || structures[STRUCTURE_FACTORY] || structures[STRUCTURE_OBSERVER] || structures[STRUCTURE_TOWER]) {
                            this.setMap(map, x, y, MAP_ON);
                            continue;
                        }
                        let lab = structures[STRUCTURE_LAB];
                        if(lab && lab.pos.inRangeTo(rp.getBoostPos(), 1)) {
                            this.setMap(map, x, y, MAP_ON);
                            continue;
                        }
                        if(structures[STRUCTURE_EXTENSION]) {
                            if(extensionCount <= 48) {
                                this.setMap(map, x, y, MAP_ON);
                                continue;
                            }
                            else extensionCount--;
                        }
                    }
                }
            });
        }

        let controller = room.controller;
        if(!controller) return;
        controller.pos.availableNeighbors(true, true).filter(pos => map.get(pos.x, pos.y) != MAP_INSIDE).forEach(pos => this.setMap(map, pos.x, pos.y, MAP_ON));
    }

    private isDangerious(map: CostMatrix, x: number, y: number): boolean{
        for (let oy = -3; oy < 4; oy++) {
            if(map.get(x - 3, y + oy) == MAP_OUTSIDE) return true;
            if(map.get(x + 3, y + oy) == MAP_OUTSIDE) return true;
            if(map.get(x - 2, y + oy) == MAP_OUTSIDE) return true;
            if(map.get(x + 2, y + oy) == MAP_OUTSIDE) return true;
        }
        for (let ox = -1; ox < 2; ox++) {
            if(map.get(x + ox, y - 3) == MAP_OUTSIDE) return true;
            if(map.get(x + ox, y + 3) == MAP_OUTSIDE) return true;
            if(map.get(x + ox, y - 2) == MAP_OUTSIDE) return true;
            if(map.get(x + ox, y + 2) == MAP_OUTSIDE) return true;
        }
        return false;
    }
}