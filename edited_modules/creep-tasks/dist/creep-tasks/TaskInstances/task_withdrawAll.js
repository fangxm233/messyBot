"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskWithdrawAll extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskWithdrawAll.taskName, target, options);
    }
    isValidTask() {
        return (_.sum(this.creep.carry) < this.creep.carryCapacity);
    }
    isValidTarget() {
        return _.sum(this.target.store) > 0;
    }
    work() {
        for (let resourceType in this.target.store) {
            let amountInStore = this.target.store[resourceType] || 0;
            if (amountInStore > 0) {
                return this.creep.withdraw(this.target, resourceType);
            }
        }
        return -1;
    }
}
TaskWithdrawAll.taskName = 'withdrawAll';
exports.TaskWithdrawAll = TaskWithdrawAll;
