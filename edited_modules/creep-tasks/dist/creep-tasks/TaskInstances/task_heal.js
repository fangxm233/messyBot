"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskHeal extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskHeal.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(HEAL) > 0);
    }
    isValidTarget() {
        return this.target && this.target.hits < this.target.hitsMax && this.target.my;
    }
    work() {
        if (this.creep.pos.isNearTo(this.target)) {
            return this.creep.heal(this.target);
        }
        else {
            this.moveToTarget(1);
        }
        return this.creep.rangedHeal(this.target);
    }
}
TaskHeal.taskName = 'heal';
exports.TaskHeal = TaskHeal;
