"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskTransferAll extends Task_1.Task {
    constructor(target, skipEnergy = false, options = {}) {
        super(TaskTransferAll.taskName, target, options);
        this.data.skipEnergy = skipEnergy;
    }
    isValidTask() {
        for (let resourceType in this.creep.carry) {
            if (this.data.skipEnergy && resourceType == RESOURCE_ENERGY) {
                continue;
            }
            let amountInCarry = this.creep.carry[resourceType] || 0;
            if (amountInCarry > 0) {
                return true;
            }
        }
        return false;
    }
    isValidTarget() {
        return _.sum(this.target.store) < this.target.storeCapacity;
    }
    work() {
        for (let resourceType in this.creep.carry) {
            if (this.data.skipEnergy && resourceType == RESOURCE_ENERGY) {
                continue;
            }
            let amountInCarry = this.creep.carry[resourceType] || 0;
            if (amountInCarry > 0) {
                return this.creep.transfer(this.target, resourceType);
            }
        }
        return -1;
    }
}
TaskTransferAll.taskName = 'transferAll';
exports.TaskTransferAll = TaskTransferAll;
