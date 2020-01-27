"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskMeleeAttack extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskMeleeAttack.taskName, target, options);
        // Settings
        this.settings.targetRange = 1;
    }
    isValidTask() {
        return this.creep.getActiveBodyparts(ATTACK) > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        return this.creep.attack(this.target);
    }
}
TaskMeleeAttack.taskName = 'meleeAttack';
exports.TaskMeleeAttack = TaskMeleeAttack;
