"use strict";
// This binds a getter/setter creep.task property
Object.defineProperty(exports, "__esModule", { value: true });
const initializer_1 = require("./utilities/initializer");
const caching_1 = require("./utilities/caching");
Object.defineProperty(Creep.prototype, 'task', {
    get() {
        if (!this._task) {
            let protoTask = this.memory.task;
            this._task = protoTask ? initializer_1.initializeTask(protoTask) : null;
        }
        return this._task;
    },
    set(task) {
        // Assert that there is an up-to-date target cache
        caching_1.TargetCache.assert();
        // Unregister target from old task if applicable
        let oldProtoTask = this.memory.task;
        if (oldProtoTask) {
            let oldRef = oldProtoTask._target.ref;
            if (Game.TargetCache.targets[oldRef]) {
                _.remove(Game.TargetCache.targets[oldRef], name => name == this.name);
            }
        }
        // Set the new task
        this.memory.task = task ? task.proto : null;
        if (task) {
            if (task.target) {
                // Register task target in cache if it is actively targeting something (excludes goTo and similar)
                if (!Game.TargetCache.targets[task.target.ref]) {
                    Game.TargetCache.targets[task.target.ref] = [];
                }
                Game.TargetCache.targets[task.target.ref].push(this.name);
            }
            // Register references to creep
            task.creep = this;
        }
        // Clear cache
        this._task = null;
    },
});
Creep.prototype.run = function () {
    if (this.task) {
        return this.task.run();
    }
};
Object.defineProperties(Creep.prototype, {
    'hasValidTask': {
        get() {
            return this.task && this.task.isValid();
        }
    },
    'isIdle': {
        get() {
            return !this.hasValidTask;
        }
    }
});
// RoomObject prototypes ===============================================================================================
Object.defineProperty(RoomObject.prototype, 'ref', {
    get: function () {
        return this.id || this.name || '';
    },
});
Object.defineProperty(RoomObject.prototype, 'targetedBy', {
    get: function () {
        // Check that target cache has been initialized - you can move this to execute once per tick if you want
        caching_1.TargetCache.assert();
        return _.map(Game.TargetCache.targets[this.ref], name => Game.creeps[name]);
    },
});
// RoomPosition prototypes =============================================================================================
Object.defineProperty(RoomPosition.prototype, 'isEdge', {
    get: function () {
        return this.x == 0 || this.x == 49 || this.y == 0 || this.y == 49;
    },
});
Object.defineProperty(RoomPosition.prototype, 'neighbors', {
    get: function () {
        let adjPos = [];
        for (let dx of [-1, 0, 1]) {
            for (let dy of [-1, 0, 1]) {
                if (!(dx == 0 && dy == 0)) {
                    let x = this.x + dx;
                    let y = this.y + dy;
                    if (0 < x && x < 49 && 0 < y && y < 49) {
                        adjPos.push(new RoomPosition(x, y, this.roomName));
                    }
                }
            }
        }
        return adjPos;
    }
});
RoomPosition.prototype.isPassible = function (ignoreCreeps = false) {
    // Is terrain passable?
    if (Game.map.getTerrainAt(this) == 'wall')
        return false;
    if (this.isVisible) {
        // Are there creeps?
        if (ignoreCreeps == false && this.lookFor(LOOK_CREEPS).length > 0)
            return false;
        // Are there structures?
        let impassibleStructures = _.filter(this.lookFor(LOOK_STRUCTURES), function (s) {
            return this.structureType != STRUCTURE_ROAD &&
                s.structureType != STRUCTURE_CONTAINER &&
                !(s.structureType == STRUCTURE_RAMPART && (s.my ||
                    s.isPublic));
        });
        return impassibleStructures.length == 0;
    }
    return true;
};
RoomPosition.prototype.isWalkable = function (ignoreCreeps = false, ignoreStructures = false) {
    // Is terrain passable?
    if (Game.map.getRoomTerrain(this.roomName).get(this.x, this.y) == TERRAIN_MASK_WALL)
        return false;
    if (this.isVisible) {
        // Are there creeps?
        if (ignoreCreeps == false && this.lookFor(LOOK_CREEPS).length > 0)
            return false;
        // Are there structures?
        if (ignoreStructures == false && _.filter(this.lookFor(LOOK_STRUCTURES), (s) => !s.isWalkable).length > 0)
            return false;
        // Are there unwalkable constructionSites?
        if (ignoreStructures == false && _.filter(this.lookFor(LOOK_CONSTRUCTION_SITES), (site) => !site.isWalkable).length > 0)
            return false;
    }
    return true;
};
RoomPosition.prototype.availableNeighbors = function (ignoreCreeps = false, ignoreStructures = false) {
    return _.filter(this.neighbors, pos => pos.isWalkable(ignoreCreeps, ignoreStructures));
};
