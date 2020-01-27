"use strict";
// TaskClaim: claims a new controller
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskClaim extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskClaim.taskName, target, options);
        // Settings
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(CLAIM) > 0);
    }
    isValidTarget() {
        return (this.target != null && (!this.target.room || !this.target.owner));
    }
    work() {
        return this.creep.claimController(this.target);
    }
}
TaskClaim.taskName = 'claim';
exports.TaskClaim = TaskClaim;
