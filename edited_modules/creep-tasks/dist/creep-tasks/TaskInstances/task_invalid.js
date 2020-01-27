"use strict";
// Invalid task assigned if instantiation fails.
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskInvalid extends Task_1.Task {
    constructor(target, options = {}) {
        super('INVALID', target, options);
    }
    isValidTask() {
        return false;
    }
    isValidTarget() {
        return false;
    }
    work() {
        return OK;
    }
}
TaskInvalid.taskName = 'invalid';
exports.TaskInvalid = TaskInvalid;
