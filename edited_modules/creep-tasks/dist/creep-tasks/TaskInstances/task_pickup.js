"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskPickup extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskPickup.taskName, target, options);
        this.settings.oneShot = true;
    }
    isValidTask() {
        return _.sum(this.creep.carry) < this.creep.carryCapacity;
    }
    isValidTarget() {
        return this.target && this.target.amount > 0;
    }
    work() {
        return this.creep.pickup(this.target);
    }
}
TaskPickup.taskName = 'pickup';
exports.TaskPickup = TaskPickup;
