"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskFortify extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskFortify.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = true;
    }
    isValidTask() {
        return (this.creep.carry.energy > 0);
    }
    isValidTarget() {
        let target = this.target;
        return (target != null && target.hits < target.hitsMax); // over-fortify to minimize extra trips
    }
    work() {
        return this.creep.repair(this.target);
    }
}
TaskFortify.taskName = 'fortify';
exports.TaskFortify = TaskFortify;
