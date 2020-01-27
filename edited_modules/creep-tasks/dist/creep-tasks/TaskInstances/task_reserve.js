"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskReserve extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskReserve.taskName, target, options);
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(CLAIM) > 0);
    }
    isValidTarget() {
        let target = this.target;
        return (target != null && !target.owner && (!target.reservation || target.reservation.ticksToEnd < 4999));
    }
    work() {
        return this.creep.reserveController(this.target);
    }
}
TaskReserve.taskName = 'reserve';
exports.TaskReserve = TaskReserve;
