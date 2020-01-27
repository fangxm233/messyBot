"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskGetRenewed extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskGetRenewed.taskName, target, options);
    }
    isValidTask() {
        let hasClaimPart = _.filter(this.creep.body, (part) => part.type == CLAIM).length > 0;
        let lifetime = hasClaimPart ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
        return this.creep.ticksToLive != undefined && this.creep.ticksToLive < 0.9 * lifetime;
    }
    isValidTarget() {
        return this.target.my;
    }
    work() {
        return this.target.renewCreep(this.creep);
    }
}
TaskGetRenewed.taskName = 'getRenewed';
exports.TaskGetRenewed = TaskGetRenewed;
