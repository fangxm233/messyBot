"use strict";
// TaskBuild: builds a construction site until creep has no energy or site is complete
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskBuild extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskBuild.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = false;
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        return this.target && this.target.my && this.target.progress < this.target.progressTotal;
    }
    work() {
        return this.creep.build(this.target);
    }
}
TaskBuild.taskName = 'build';
exports.TaskBuild = TaskBuild;
