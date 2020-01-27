import { towerRepairLine } from "../config";
import { profile } from "../profiler/decorator";
import { hasAggressiveBodyParts, possibleTowerDamage, wouldBreakDefend } from "../utils";
import { Process } from "../process/process";
import { Porcesses } from "../process/processes";

@profile
export class Tower {
    static acted: {[roomName: string]: boolean} = {};

    static run(room: Room) {
        function calDecayTime(structure: Structure){
            if(structure.structureType == STRUCTURE_ROAD){
                return (structure.hits - structure.hitsMax * 0.5) / ROAD_DECAY_AMOUNT * ROAD_DECAY_TIME;
            }
            if(structure.structureType == STRUCTURE_CONTAINER){
                return (structure.hits - structure.hitsMax * 0.5) / CONTAINER_DECAY * CONTAINER_DECAY_TIME_OWNED;
            }
            if(structure.structureType == STRUCTURE_RAMPART){
                return (structure.hits - 100000) / RAMPART_DECAY_AMOUNT * RAMPART_DECAY_TIME;
            }
            if(structure.structureType == STRUCTURE_WALL){
                if(structure.hits < 100000) return 0;
                return Infinity;
            }
            if(structure.hits < structure.hitsMax) return -Infinity;
            return Infinity;
        }
        let towers = room.towers;
        let injuredCreeps = room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.hits < creep.hitsMax;
            }
        });
        let enemies = room.find(FIND_HOSTILE_CREEPS, {filter: creep => hasAggressiveBodyParts(creep, false)});
        let timeLeft = 0;
        for (const enemy of enemies) 
            if(enemy.ticksToLive && enemy.ticksToLive > timeLeft) timeLeft = enemy.ticksToLive;
        let structure: Structure | undefined = undefined;
        if(room.memory.repairCountDown <= 0 || room.memory.underAttacking){
            structure = _.min(room.structures, calDecayTime);
            let ticks = calDecayTime(structure);
            room.memory.repairCountDown = Math.min(1000, ticks);
        }
        // buildings = room.structures.filter(structure => 
        //         structure.hits < structure.hitsMax * 0.5 && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART
        //         || (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < 100000);
        let walls: Structure[] = [];
        if(!structure && room.memory.storedEnergy > towerRepairLine){
            walls = room.structures.filter(
                structure => (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART)
                        && structure.hits < structure.hitsMax);
        }
        for (const tower of towers) {
            if (enemies.length) {
                let enemy = this.solveCanBeAttack(room, enemies);
                let isc = false;
                if(enemy) {
                    isc = true;
                    tower.attack(enemy);
                    Tower.acted[room.name] = true;
                } else if(Game.time % 5 == 0) {
                    isc = true;
                    tower.attack(enemies[Math.floor(Math.random() * enemies.length)]);
                    Tower.acted[room.name] = true;
                }
                Memory.rooms[tower.pos.roomName].underAttacking = true;
                Memory.rooms[tower.pos.roomName].timeLeft = timeLeft;
                Memory.UnderAttacking = true;
                let playerEnemies = enemies.filter(creep => creep.owner.username != 'Invader' && hasAggressiveBodyParts(creep, false));
                if(playerEnemies.length && !Process.getProcess(room.name, 'activeDefend')) Porcesses.processActiveDefend(room.name);
                if(isc) continue;
            }
            else{
                Memory.rooms[tower.pos.roomName].underAttacking = false;
                Memory.UnderAttacking = false;
            } 
            if(injuredCreeps.length){
                let target = _.min(injuredCreeps, creep => creep.hits);
                tower.heal(target);
                Tower.acted[room.name] = true;
                continue;
            }
            if (structure){
                tower.repair(structure);
                Tower.acted[room.name] = true;
                continue;
            }
            if(walls.length){
                let target = _.min(walls, wall => wall.hits);
                tower.repair(target);
                Tower.acted[room.name] = true;
            }
        }
    }

    static aimAt(room: Room, creep: Creep): boolean {
        if(this.acted[room.name]) return false;

        room.towers.forEach(tower => tower.attack(creep));
        return true;
    }
    
    static solveCanBeAttack(room: Room, targets: Creep[]) {
        for (let target of targets) {
            let towerAttack = possibleTowerDamage(room, target.pos);
            if(wouldBreakDefend(target.body, target.pos, target.owner.username, towerAttack)) return target;
        }
        return undefined;
    }
}