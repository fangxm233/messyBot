import { profile } from "../profiler/decorator";
import { Visualizer } from "../programs/Visualizer";
import { Traveler } from "../programs/Traveler";
import { intel } from "../programs/Intel";

export const PLAIN_COST = 3;
export const SWAMP_COST = 4;
export const WALL_COST = 15 * PLAIN_COST;
export const EXISTING_PATH_COST = PLAIN_COST - 1;

@profile
export class RoadPlanner{
    roomName: string;
    room: Room;

    constructor(roomName: string){
        this.roomName = roomName;
        this.room = Game.rooms[roomName];
    }

    generateRoomPath(target: string):{paths: {
        harvesterPath: {
            0: savedPath;
            1: savedPath;
        }
        mineralPath: savedPath;
        controllerPath: savedPath;
    }, finished: boolean }{
        let owned = false;
        let targetRoom = Game.rooms[target];
        if(targetRoom){
            let controller = targetRoom.controller;
            if(controller && controller.my) owned = true;
        } else return { finished: false } as any;

        let result = { harvesterPath: {} } as any;
        
        let harvest = Memory.stableData[target].harvesterPosition;
        for (const posId in harvest) {
            let pos = harvest[posId];
            let path = this.generatePathTo(pos);
            result.harvesterPath[posId] = RoadPlanner.zipPath(path);
            this.updateMatrix(path);
        }

        let controller = targetRoom.controller;
        if(owned && controller){
            let path = this.generatePathTo(controller.pos);
            result.controllerPath = RoadPlanner.zipPath(path);
            this.updateMatrix(path);

            let mineral = targetRoom.find(FIND_MINERALS)[0];
            if(mineral){
                let path = this.generatePathTo(mineral.pos);
                result.mineralPath = RoadPlanner.zipPath(path);
                this.updateMatrix(path);
            }
        }

        return { paths: result, finished: true };
    }

    generatePathTo(pos: RoomPosition, cutting: number = 0): RoomPosition[]{
        let center = Memory.stableData[this.roomName].basePosition as RoomPosition;
        center = new RoomPosition(center.x + 5, center.y + 5, this.roomName);
        let result = PathFinder.search(center, {pos: pos, range: 1}, { maxOps: 1e4,
            roomCallback: roomName => intel[roomName] ? intel[roomName].buildingCostMatrix : false });
        result.path.splice(result.path.length - cutting, cutting);
        result.path.unshift(center);
        _.remove(result.path, pos => pos.isEdge);
        return result.path;
    }

    updateMatrix(positions: RoomPosition[]){
        for (const pos of positions) {
            let matrix = intel[pos.roomName].buildingCostMatrix;
            matrix.set(pos.x, pos.y, EXISTING_PATH_COST);
        }
    }

    static zipPath(positions: RoomPosition[]): savedPath{
        let result: savedPath = { paths: [], dis: positions.length };
        let saved = { pos: positions[0] } as pathSeg;
        let path = '';
        let lastRoom: string = positions[0].roomName;

        for (let i = 0; i < positions.length; i++) {
            if(i == positions.length - 1) {
                saved.path = path;
                result.paths.push(saved);
                break;
            }
            const pos = positions[i];
            const posNext = positions[i + 1];
            if(posNext.isEdge) continue;
            if(pos.roomName != lastRoom) {
                lastRoom = pos.roomName;
                saved.path = path;
                result.paths.push(saved);
                saved = { pos: pos } as pathSeg;
                path = '';
            }
            if(pos.isEdge) continue;
            path += pos.getDirectionTo(posNext);
        }
        
        return result;
    }

    static unzipPath(savedPath: savedPath): RoomPosition[]{
        let result: RoomPosition[] = [];
        for (const path of savedPath.paths) {
            result.push(path.pos);
            let lastPos = path.pos;
            for (const dir of path.path) {
                let pos = Traveler.positionAtDirection(lastPos, Number.parseInt(dir));
                if(!pos) continue;
                result.push(pos);
                lastPos = pos;
            }
        }
        return result;
    }
}