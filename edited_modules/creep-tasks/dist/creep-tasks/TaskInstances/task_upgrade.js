"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskUpgrade extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskUpgrade.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = false;
    }
    isValidTask() {
        return (this.creep.carry.energy > 0);
    }
    isValidTarget() {
        return this.target && this.target.my;
    }
    work() {
        return this.creep.upgradeController(this.target);
    }
}
TaskUpgrade.taskName = 'upgrade';
exports.TaskUpgrade = TaskUpgrade;
