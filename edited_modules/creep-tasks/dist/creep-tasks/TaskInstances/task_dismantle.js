"use strict";
// TaskDismantle: dismantles a structure
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskDismantle extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskDismantle.taskName, target, options);
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(WORK) > 0);
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        return this.creep.dismantle(this.target);
    }
}
TaskDismantle.taskName = 'dismantle';
exports.TaskDismantle = TaskDismantle;
