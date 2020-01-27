"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskGoToRoom extends Task_1.Task {
    constructor(roomName, options = {}) {
        super(TaskGoToRoom.taskName, { ref: '', pos: new RoomPosition(25, 25, roomName) }, options);
        // Settings
        this.settings.targetRange = 24; // Target is almost always controller flag, so range of 2 is acceptable
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
TaskGoToRoom.taskName = 'goToRoom';
exports.TaskGoToRoom = TaskGoToRoom;
