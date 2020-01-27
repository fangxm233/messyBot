"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskRepair extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskRepair.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits < this.target.hitsMax;
    }
    work() {
        let result = this.creep.repair(this.target);
        if (this.target.structureType == STRUCTURE_ROAD) {
            // prevents workers from idling for a tick before moving to next target
            let newHits = this.target.hits + this.creep.getActiveBodyparts(WORK) * REPAIR_POWER;
            if (newHits > this.target.hitsMax) {
                this.finish();
            }
        }
        return result;
    }
}
TaskRepair.taskName = 'repair';
exports.TaskRepair = TaskRepair;
