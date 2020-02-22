import { SourceManager } from "../programs/sourceManager";
import { Role } from "./role";
import { Alloter, ALLOT_TRANSPORT } from "../logistics/alloter";
import { profile } from "../profiler/decorator";
import { Process } from "../process/process";
import { Processes } from "../process/processes";
import { refreshRoomPosition } from "../utils";

@profile
export class RoleHarvester extends Role {
    mode: 'none' | 'container' | 'link';
    standPos: RoomPosition;
    sourceId: Id<Source>;
    containerId: Id<StructureContainer>;
    linkId: Id<StructureLink>;

    run() {
        // let cpu0 = Game.cpu.getUsed();
        let memory = this.creep.memory;
        // delete memory.allotUnit;
        if (!memory.allotUnit) {
            memory.allotUnit = SourceManager.allotSource(Game.rooms[memory.spawnRoom]);
        }
        if (!memory.allotUnit) return;
        if (!(this.creep.ticksToLive && this.creep.ticksToLive <= this.creep.body.length * 3 + 20))
            Alloter.refreshDirty(memory.allotUnit);
        if (Game.cpu.bucket < 5000) return;
        // let cpu1 = Game.cpu.getUsed();
        if (this.onPos() && !this.mode) this.judgeMode();

        let drops = this.creep.pos.lookFor(LOOK_RESOURCES).filter(resource => resource.resourceType == RESOURCE_ENERGY);
        if (drops.length) this.creep.pickup(drops[0]);
        // let cpu2 = Game.cpu.getUsed();
        if (Game.time % 10 == 0) {
            let enemies = this.creep.room.find(FIND_HOSTILE_CREEPS,
                { filter: creep => creep.bodyCounts[WORK] || creep.bodyCounts[ATTACK] || creep.bodyCounts[RANGED_ATTACK] });
            if (enemies.length) {
                let longest = 0;
                for (const enemy of enemies) {
                    if (enemy.ticksToLive && enemy.ticksToLive > longest) longest = enemy.ticksToLive;
                }
                Memory.rooms[this.creep.pos.roomName].underAttacking = true;
                Memory.rooms[this.creep.pos.roomName].timeLeft = longest;
                if (!this.creep.room.memory.isClaimed) {
                    let process = Process.getProcess(this.creep.memory.spawnRoom, 'defend', 'targetName', this.creep.room.name);
                    if (!process) Processes.processDefend(this.creep.memory.spawnRoom, this.creep.room.name, 'creep');
                }
            }

            if (!this.creep.room.memory.isClaimed) {
                let cores = this.creep.room.find(FIND_HOSTILE_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_INVADER_CORE });
                if (cores.length) {
                    let process = Process.getProcess(this.creep.memory.spawnRoom, 'defend', 'targetName', this.creep.room.name);
                    if (!process) Processes.processDefend(this.creep.memory.spawnRoom, this.creep.room.name, 'coreDis');
                }
            }
        }

        switch (this.mode) {
            case 'container':
                this.runContainer();
                break;
            case 'link':
                this.runLink();
                break;
            case 'none':
                this.runNone();
                break;
            default:
                break;
        }
        // if(this.creep.memory.id == 1) console.log('cpu0', Game.cpu.getUsed() - cpu0);
        // if(this.creep.memory.id == 1) console.log('cpu1', Game.cpu.getUsed() - cpu1);
        // if(this.creep.memory.id == 1) console.log('cpu2', Game.cpu.getUsed() - cpu2);
    }

    private judgeMode() {
        if (!this.sourceId) {
            let source = this.creep.pos.findInRange(FIND_SOURCES, 1)[0];
            if (source) this.sourceId = source.id;
        }

        let links = this.creep.pos.findInRange(FIND_MY_STRUCTURES, 1, { filter: { structureType: STRUCTURE_LINK } }) as StructureLink[];
        if (links.length) {
            this.linkId = links[0].id;
            this.mode = 'link';
        }

        let containers = this.creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } }) as StructureContainer[];
        if (containers.length) {
            if (this.mode == 'link') {
                containers[0].destroy();
                return;
            }
            this.containerId = containers[0].id;
            this.mode = 'container';
            return;
        }

        if (!this.mode) this.mode = 'none';
    }

    private onPos(): boolean {
        let memory = this.creep.memory;
        let targetName = memory.allotUnit.roomName;

        if (!this.standPos) {
            if (Memory.stableData[targetName] && Memory.stableData[targetName].harvesterPosition
                && Memory.stableData[targetName].harvesterPosition[memory.allotUnit.id]) {
                this.standPos = Memory.stableData[targetName].harvesterPosition[memory.allotUnit.id];
            }
            if (!this.standPos) return false;
            this.standPos = refreshRoomPosition(this.standPos);
        }
        if (this.creep.pos.isEqualTo(this.standPos)) return true;

        if (this.creep.room.name != this.standPos.roomName) {
            this.creep.travelTo(this.standPos);
            return false;
        }

        if (this.creep.pos.getRangeTo(this.standPos) != 0) {
            this.creep.travelTo(this.standPos);
            return false;
        }

        return true;
    }

    private runNone() {
        if (this.sourceId) {
            let source = Game.getObjectById<Source>(this.sourceId);
            if (source && source.energy) this.creep.harvest(source);
        }
    }

    private runContainer() {
        let container = Game.getObjectById<StructureContainer>(this.containerId);
        if (container) {
            // let cpu0 = Game.cpu.getUsed();
            if (this.creep.store.getFreeCapacity() > 0 && container.store.energy >= this.creep.store.getCapacity()) {
                this.creep.withdraw(container, RESOURCE_ENERGY);
            }
            // let cpu1 = Game.cpu.getUsed();
            // if(this.creep.memory.id == 0) console.log('dif', cpu1 - cpu0);

            if (container.hitsMax - container.hits >= 600 && this.creep.store.getUsedCapacity()) {
                this.creep.repair(container);
                return;
            }

            if (!container.store.getFreeCapacity()) return;
        } else delete this.creep.memory.mode;
        if (this.sourceId) {
            let source = Game.getObjectById<Source>(this.sourceId);
            if (source && source.energy) this.creep.harvest(source);
        }
        // if(this.creep.memory.id == 0) console.log('cpu0', Game.cpu.getUsed() - cpu0);
        // if(this.creep.memory.id == 0) console.log('cpu1', Game.cpu.getUsed() - cpu1);
    }

    private runLink() {
        let memory = this.creep.memory;

        if (this.sourceId) {
            let source = Game.getObjectById<Source>(this.sourceId);
            if (source && source.energy) this.creep.harvest(source);
        }

        let link = Game.getObjectById<StructureLink>(this.linkId);
        let centerLink = Game.getObjectById<StructureLink>(this.creep.room.memory.centerLink);
        let upgLink = Game.getObjectById<StructureLink>(this.creep.room.memory.upgradeLink);
        if (link && centerLink) {
            let hPower = this.creep.bodyCounts[WORK] * 2;
            if (upgLink && upgLink.store.energy < 600 && link.store.energy + upgLink.store.energy >= 800) {
                link.transferEnergy(upgLink);
            } else if (link.store.energy >= 800 - hPower && centerLink.store.energy == 0) {
                link.transferEnergy(centerLink);
                delete Memory.rooms[this.creep.room.name].allot[ALLOT_TRANSPORT][memory.allotUnit.id];
            }

            if (this.creep.store.getFreeCapacity() < hPower) {
                this.creep.transfer(link, RESOURCE_ENERGY);
            }
        }
    }
}
