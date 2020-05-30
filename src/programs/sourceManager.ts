import { Alloter, allotUnit, ALLOT_HARVEST, ALLOT_TRANSPORT, ALLOT_RESERVE, ALLOT_MINERAL_TRANSPORT, ALLOT_FILLER } from '../logistics/alloter'
import { isResource, isTombstone, isStructure, isRuin } from '../declarations/typeGuards';
import { profile } from '../profiler/decorator';
import { RoomPlanner, fillerCount } from '../roomPlanner/RoomPlanner';

@profile
export class SourceManager {
    static analyzeRoom(roomName: string, from?: string) {
        if(!Memory.rooms[roomName]) Memory.rooms[roomName] = {} as any;
        let room = Game.rooms[roomName];
        if(!room) return;
        Alloter.removeType(ALLOT_HARVEST, room.name);
        Alloter.removeType(ALLOT_TRANSPORT, room.name);
        const containers = room.containers;
        const sources = room.find(FIND_SOURCES);
        for (const s of sources) {
            let hunit = new allotUnit(room.name, {pos: s.pos});
            let tunit = new  allotUnit(room.name, {pos: s.pos});
            Alloter.addUnit(hunit, ALLOT_HARVEST);
            Alloter.addUnit(tunit, ALLOT_TRANSPORT);

            // if(!Memory.stableData[room.name]) Memory.stableData[room.name] = {} as any;
            // if(!Memory.stableData[room.name].harvesterPosition) Memory.stableData[room.name].harvesterPosition = {} as any;
            // Memory.stableData[room.name].harvesterPosition[hunit.id] = s.pos;

            // s.pos.createFlag('har_' + roomName + '_' + hunit.id);
        }

        let mineral = room.find(FIND_MINERALS)[0];
        if(mineral){
            room.memory.mineral.mineralId = mineral.id;
            room.memory.mineral.type = mineral.mineralType;
        }
        let mtunit = new allotUnit(room.name, { mineral: true });
        Alloter.addUnit(mtunit, ALLOT_MINERAL_TRANSPORT);

        if (room.storage)
            room.memory.storage = room.storage.id;
        else
            for (const container of containers) {
                if(container.pos.findInRange(FIND_SOURCES, 1).length) continue;
                room.memory.storage = container.id;
                return;
            }
        
        new RoomPlanner(from ? from : roomName).planRoom(roomName);
    }

    static refreshRoom(room: Room){
        if(!room.memory.repairCountDown) room.memory.repairCountDown = 0;
        if(room.memory.underAttacking) room.memory.timeLeft--;
        if(room.memory.repairCountDown > 0) room.memory.repairCountDown--;
        if(room.memory.timeLeft <= 0) room.memory.underAttacking = false;

        if(!Memory.stableData[room.name]) Memory.stableData[room.name] = {} as any;
        if(Game.time % 20 == 0 && !Memory.stableData[room.name].finished) new RoomPlanner(room.name).planRoom(room.name);
        for (const r of Memory.colonies[room.name]) {
            if(!Memory.stableData[r.name]) Memory.stableData[r.name] = {} as any;
            if(!Memory.rooms[r.name]) this.analyzeRoom(r.name);
            if(Memory.rooms[r.name].underAttacking) Memory.rooms[r.name].timeLeft--;
            if(Memory.rooms[r.name].timeLeft <= 0) Memory.rooms[r.name].underAttacking = false;
            if(Game.time % 20 == 0 && !Memory.stableData[r.name].finished) new RoomPlanner(room.name).planRoom(r.name);
            if(!Alloter.exist(ALLOT_RESERVE, room.name, 'name', r.name)){
                let unit = new allotUnit(room.name, { name: r.name, ticksToEnd: 0 });
                Alloter.addUnit(unit, ALLOT_RESERVE);
            }
            let unit = Alloter.getUnitWithKeyValue(ALLOT_RESERVE, room.name, 'name', r.name);
            if(unit && unit.data.ticksToEnd > 0) unit.data.ticksToEnd--;
        }

        let controller = room.controller;
        if(controller){
            if(Alloter.getUnitCount(ALLOT_FILLER, room.name) < fillerCount[controller.level]){
                let unit = new allotUnit(room.name, undefined);
                Alloter.addUnit(unit, ALLOT_FILLER);
                unit.available = true;
            }
        }

        if(room.storage)
            room.memory.storage = room.storage.id;
        else{
            const containers = room.containers;
            for (const container of containers) {
                if(container.pos.findInRange(FIND_SOURCES, 1).length) continue;
                if(new RoomPlanner(room.name).isFillerContainer(container)) continue;
                room.memory.storage = container.id;
                return;
            }
        }

        let extractor = Game.getObjectById(room.memory.mineral.extractorId);
        if(!room.memory.mineral.extractorId || !extractor){
            if(room.extractor) room.memory.mineral.extractorId = room.extractor.id;
        }
        
        let mContainer = Game.getObjectById(room.memory.mineral.containerId);
        if(!room.memory.mineral.containerId || !mContainer){
            let mineral = Game.getObjectById<Mineral>(room.memory.mineral.mineralId);
            if(mineral != null){
                let pos = mineral.pos;
                let containers = _.filter(room.containers, structure => structure.pos.getRangeTo(pos) == 1 )
                if(containers.length) room.memory.mineral.containerId = containers[0].id;
            }
        }

        let cLink = Game.getObjectById(room.memory.centerLink);
        let uLink = Game.getObjectById(room.memory.upgradeLink);
        if(!cLink) room.memory.centerLink = '';
        if(!uLink) room.memory.upgradeLink = '';
        if(room.memory.upgradeLink && room.memory.centerLink && cLink && uLink) return;
        const links = room.links;
        for (const link of links) {
            if(link.id == room.memory.upgradeLink) continue;
            if(!room.memory.upgradeLink && room.controller && room.controller.pos.getRangeTo(link.pos) <= 2)
                room.memory.upgradeLink = link.id;
            if(!room.memory.centerLink && !link.pos.findInRange(FIND_SOURCES, 2).length){
                room.memory.centerLink = link.id;
                return;
            }
        }
    }

    static allotSource(room: Room) {
        if(Alloter.getUnitCount(ALLOT_HARVEST, room.name) <= 0) this.analyzeRoom(room.name);
        let source = Alloter.allot(ALLOT_HARVEST, room.name);
        if(source) return source;
        for (const r of Memory.colonies[room.name]) {
            if(!r.enable) continue;
            if(Alloter.getUnitCount(ALLOT_HARVEST, r.name) <= 0) this.analyzeRoom(r.name, room.name);
            source = Alloter.allot(ALLOT_HARVEST, r.name);
            if(source) return source;
        }
        return undefined;
    }

    static allotTransporter(room: Room) {
        if(Alloter.getUnitCount(ALLOT_TRANSPORT, room.name) == -1) this.analyzeRoom(room.name);
        let source = Alloter.allot(ALLOT_TRANSPORT, room.name);
        if(source) return source;
        for (const r of Memory.colonies[room.name]) {
            if(!r.enable) continue;
            if(Alloter.getUnitCount(ALLOT_TRANSPORT, r.name) == -1) this.analyzeRoom(r.name, room.name);
            source = Alloter.allot(ALLOT_TRANSPORT, r.name);
            if(source) return source;
        }
        return undefined;
    }

    static allotReservist(room: Room) {
        if(Alloter.getUnitCount(ALLOT_RESERVE, room.name) == -1) return;
        let source = Alloter.allot(ALLOT_RESERVE, room.name);
        while (source) {
            for (const r of Memory.colonies[room.name]) 
                if(source.data.name == r.name && r.enable && source.data.ticksToEnd < 3000) return source;
            source = Alloter.allot(ALLOT_RESERVE, room.name);
        }
        return undefined;
    }

    static getSource(creep: Creep, isFiller: boolean, minEnergy?: number, singleRoom?: boolean): boolean {
        if(Game.time % 10 == 0) delete creep.memory.sourceTarget;
        if(!minEnergy) minEnergy = 0;
        if(!creep.memory.sourceTarget){
            let rp = new RoomPlanner(creep.room.name);
            let remain = Math.max(creep.store.getFreeCapacity() * 0.5, minEnergy);
            let candidates: (Tombstone | Structure | Resource | Ruin)[] = creep.room.find(FIND_TOMBSTONES, { filter: tomb => tomb.store.energy >= remain });
            candidates.push(...creep.room.find(FIND_DROPPED_RESOURCES, { filter: drop => drop.resourceType == RESOURCE_ENERGY && drop.amount > remain }));
            candidates.push(...creep.room.find(FIND_RUINS, { filter: ruin => ruin.store.energy >= remain}));
            if(creep.room.storage){
                if (creep.room.storage.energy >= remain) candidates.push(creep.room.storage);
            }
            if(creep.room.terminal){
                if (creep.room.terminal.energy >= remain) candidates.push(creep.room.terminal);
            }
            candidates.push(..._.filter(creep.room.containers, container => !(rp.isFillerContainer(container) && !isFiller) && container.store.energy >= remain));
            candidates.push(..._.filter(creep.room.links, link => link.store.energy >= remain));
            if(!singleRoom && Memory.rooms[creep.memory.spawnRoom] && Memory.rooms[creep.memory.spawnRoom].storage){
                let storage = Game.getObjectById<StructureStorage>(Memory.rooms[creep.memory.spawnRoom].storage);
                if (storage && storage.store.energy >= remain) candidates.push(storage);
            }
            if(candidates.length){
                let target = creep.pos.findClosestByMultiRoomRange(candidates);
                if(target) creep.memory.sourceTarget = target.id;
            }
        }
        if(creep.memory.sourceTarget){
            let target = Game.getObjectById<Structure | Tombstone | Resource | Ruin>(creep.memory.sourceTarget);
            if(target) {
                if (isStructure(target)) 
                    if(creep.pos.isNearTo(target)) {
                        let code = creep.withdraw(target, RESOURCE_ENERGY);
                        delete creep.memory.sourceTarget;
                        return code == OK;
                    } else {
                        creep.travelTo(target);
                        return true;
                    }
                if(isTombstone(target)) 
                    if(creep.pos.isNearTo(target)) {
                        let code = creep.withdraw(target, RESOURCE_ENERGY);
                        delete creep.memory.sourceTarget;
                        return code == OK;
                    } else {
                        creep.travelTo(target);
                        return true;
                    }
                if(isResource(target)) 
                    if(creep.pos.isNearTo(target)) {
                        let code = creep.pickup(target);
                        delete creep.memory.sourceTarget;
                        return code == OK;
                    } else {
                        creep.travelTo(target);
                        return true;
                    }
                if(isRuin(target))
                    if(creep.pos.isNearTo(target)) {
                        let code = creep.withdraw(target, RESOURCE_ENERGY);
                        delete creep.memory.sourceTarget;
                        return code == OK;
                    } else {
                        creep.travelTo(target);
                        return true;
                    }
            }
            else delete creep.memory.sourceTarget;
        }
        return false;
    }

    // static getSourceByRoom(creep: Creep, room: Room) {
    //     var storage = Game.getObjectById<StructureStorage>(room.memory.storage);
    //     if (storage) {
    //         if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    //             creep.travelTo(storage);
    //         }
    //     }
    // }
}

(global as any).SourceManager = SourceManager;