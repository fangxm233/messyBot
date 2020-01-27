"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskRangedAttack extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskRangedAttack.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return this.creep.getActiveBodyparts(RANGED_ATTACK) > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        return this.creep.rangedAttack(this.target);
    }
}
TaskRangedAttack.taskName = 'rangedAttack';
exports.TaskRangedAttack = TaskRangedAttack;
