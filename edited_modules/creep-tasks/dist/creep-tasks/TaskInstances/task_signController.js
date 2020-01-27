"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
class TaskSignController extends Task_1.Task {
    constructor(target, signature = 'Your signature here', options = {}) {
        super(TaskSignController.taskName, target, options);
        this.data.signature = signature;
    }
    isValidTask() {
        return true;
    }
    isValidTarget() {
        let controller = this.target;
        return (!controller.sign || controller.sign.text != this.data.signature);
    }
    work() {
        return this.creep.signController(this.target, this.data.signature);
    }
}
TaskSignController.taskName = 'signController';
exports.TaskSignController = TaskSignController;
