"use strict";
// TaskDrop: drops a resource at a position
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskDrop extends Task_1.Task {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        if (target instanceof RoomPosition) {
            super(TaskDrop.taskName, { ref: '', pos: target }, options);
        }
        else {
            super(TaskDrop.taskName, { ref: '', pos: target.pos }, options);
        }
        // Settings
        this.settings.oneShot = true;
        this.settings.targetRange = 0;
        // Data
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }
    isValidTask() {
        let amount = this.data.amount || 1;
        let resourcesInCarry = this.creep.carry[this.data.resourceType] || 0;
        return resourcesInCarry >= amount;
    }
    isValidTarget() {
        return true;
    }
    isValid() {
        // It's necessary to override task.isValid() for tasks which do not have a RoomObject target
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            let isValid = false;
            if (this.parent) {
                isValid = this.parent.isValid();
            }
            this.finish();
            return isValid;
        }
    }
    work() {
        return this.creep.drop(this.data.resourceType, this.data.amount);
    }
}
TaskDrop.taskName = 'drop';
exports.TaskDrop = TaskDrop;
