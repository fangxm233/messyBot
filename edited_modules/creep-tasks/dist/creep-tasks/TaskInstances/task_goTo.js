"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
function hasPos(obj) {
    return obj.pos != undefined;
}
class TaskGoTo extends Task_1.Task {
    constructor(target, options = {}) {
        if (hasPos(target)) {
            super(TaskGoTo.taskName, { ref: '', pos: target.pos }, options);
        }
        else {
            super(TaskGoTo.taskName, { ref: '', pos: target }, options);
        }
        // Settings
        this.settings.targetRange = 1;
    }
    isValidTask() {
        return !this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange);
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
        return OK;
    }
}
TaskGoTo.taskName = 'goTo';
exports.TaskGoTo = TaskGoTo;
