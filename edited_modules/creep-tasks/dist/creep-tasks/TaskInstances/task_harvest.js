"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
function isSource(obj) {
    return obj.energy != undefined;
}
class TaskHarvest extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskHarvest.taskName, target, options);
    }
    isValidTask() {
        return _.sum(this.creep.carry) < this.creep.carryCapacity;
    }
    isValidTarget() {
        // if (this.target && (this.target instanceof Source ? this.target.energy > 0 : this.target.mineralAmount > 0)) {
        // 	// Valid only if there's enough space for harvester to work - prevents doing tons of useless pathfinding
        // 	return this.target.pos.availableNeighbors().length > 0 || this.creep.pos.isNearTo(this.target.pos);
        // }
        // return false;
        if (isSource(this.target)) {
            return this.target.energy > 0;
        }
        else {
            return this.target.mineralAmount > 0;
        }
    }
    work() {
        return this.creep.harvest(this.target);
    }
}
TaskHarvest.taskName = 'harvest';
exports.TaskHarvest = TaskHarvest;
