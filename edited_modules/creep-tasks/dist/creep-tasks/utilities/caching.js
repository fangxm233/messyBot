"use strict";
// Caches targets every tick to allow for RoomObject.targetedBy property
Object.defineProperty(exports, "__esModule", { value: true });
class TargetCache {
    constructor() {
        this.targets = {};
        this.tick = Game.time; // record last refresh
    }
    // Generates a hash table for targets: key: TargetRef, val: targeting creep names
    cacheTargets() {
        this.targets = {};
        for (let i in Game.creeps) {
            let creep = Game.creeps[i];
            let task = creep.memory.task;
            // Perform a faster, primitive form of _.map(creep.task.manifest, task => task.target.ref)
            while (task) {
                if (!this.targets[task._target.ref])
                    this.targets[task._target.ref] = [];
                this.targets[task._target.ref].push(creep.name);
                task = task._parent;
            }
        }
    }
    // Assert that there is an up-to-date target cache
    static assert() {
        if (!(Game.TargetCache && Game.TargetCache.tick == Game.time)) {
            Game.TargetCache = new TargetCache();
            Game.TargetCache.build();
        }
    }
    // Build the target cache
    build() {
        this.cacheTargets();
    }
}
exports.TargetCache = TargetCache;
