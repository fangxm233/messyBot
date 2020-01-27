"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const task_attack_1 = require("./TaskInstances/task_attack");
const task_build_1 = require("./TaskInstances/task_build");
const task_claim_1 = require("./TaskInstances/task_claim");
const task_dismantle_1 = require("./TaskInstances/task_dismantle");
const task_fortify_1 = require("./TaskInstances/task_fortify");
const task_getBoosted_1 = require("./TaskInstances/task_getBoosted");
const task_getRenewed_1 = require("./TaskInstances/task_getRenewed");
const task_goTo_1 = require("./TaskInstances/task_goTo");
const task_goToRoom_1 = require("./TaskInstances/task_goToRoom");
const task_harvest_1 = require("./TaskInstances/task_harvest");
const task_heal_1 = require("./TaskInstances/task_heal");
const task_meleeAttack_1 = require("./TaskInstances/task_meleeAttack");
const task_pickup_1 = require("./TaskInstances/task_pickup");
const task_rangedAttack_1 = require("./TaskInstances/task_rangedAttack");
const task_repair_1 = require("./TaskInstances/task_repair");
const task_reserve_1 = require("./TaskInstances/task_reserve");
const task_signController_1 = require("./TaskInstances/task_signController");
const task_transfer_1 = require("./TaskInstances/task_transfer");
const task_upgrade_1 = require("./TaskInstances/task_upgrade");
const task_withdraw_1 = require("./TaskInstances/task_withdraw");
const task_drop_1 = require("./TaskInstances/task_drop");
const task_transferAll_1 = require("./TaskInstances/task_transferAll");
const task_withdrawAll_1 = require("./TaskInstances/task_withdrawAll");
class Tasks {
    /* Tasks.chain allows you to transform a list of tasks into a single task, where each subsequent task in the list
     * is the previous task's parent. SetNextPos will chain Task.nextPos as well, preventing creeps from idling for a
     * tick between tasks. If an empty list is passed, null is returned. */
    static chain(tasks, setNextPos = true) {
        if (tasks.length == 0) {
            return null;
        }
        if (setNextPos) {
            for (let i = 0; i < tasks.length - 1; i++) {
                tasks[i].options.nextPos = tasks[i + 1].targetPos;
            }
        }
        // Make the accumulator task from the end and iteratively fork it
        let task = _.last(tasks); // start with last task
        tasks = _.dropRight(tasks); // remove it from the list
        for (let i = (tasks.length - 1); i >= 0; i--) { // iterate over the remaining tasks
            task = task.fork(tasks[i]);
        }
        return task;
    }
    static attack(target, options = {}) {
        return new task_attack_1.TaskAttack(target, options);
    }
    static build(target, options = {}) {
        return new task_build_1.TaskBuild(target, options);
    }
    static claim(target, options = {}) {
        return new task_claim_1.TaskClaim(target, options);
    }
    static dismantle(target, options = {}) {
        return new task_dismantle_1.TaskDismantle(target, options);
    }
    static drop(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new task_drop_1.TaskDrop(target, resourceType, amount, options);
    }
    static fortify(target, options = {}) {
        return new task_fortify_1.TaskFortify(target, options);
    }
    static getBoosted(target, boostType, amount = undefined, options = {}) {
        return new task_getBoosted_1.TaskGetBoosted(target, boostType, amount, options);
    }
    static getRenewed(target, options = {}) {
        return new task_getRenewed_1.TaskGetRenewed(target, options);
    }
    static goTo(target, options = {}) {
        return new task_goTo_1.TaskGoTo(target, options);
    }
    static goToRoom(target, options = {}) {
        return new task_goToRoom_1.TaskGoToRoom(target, options);
    }
    static harvest(target, options = {}) {
        return new task_harvest_1.TaskHarvest(target, options);
    }
    static heal(target, options = {}) {
        return new task_heal_1.TaskHeal(target, options);
    }
    static meleeAttack(target, options = {}) {
        return new task_meleeAttack_1.TaskMeleeAttack(target, options);
    }
    static pickup(target, options = {}) {
        return new task_pickup_1.TaskPickup(target, options);
    }
    static rangedAttack(target, options = {}) {
        return new task_rangedAttack_1.TaskRangedAttack(target, options);
    }
    static repair(target, options = {}) {
        return new task_repair_1.TaskRepair(target, options);
    }
    static reserve(target, options = {}) {
        return new task_reserve_1.TaskReserve(target, options);
    }
    static signController(target, signature, options = {}) {
        return new task_signController_1.TaskSignController(target, signature, options);
    }
    static transfer(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new task_transfer_1.TaskTransfer(target, resourceType, amount, options);
    }
    static transferAll(target, skipEnergy = false, options = {}) {
        return new task_transferAll_1.TaskTransferAll(target, skipEnergy, options);
    }
    static upgrade(target, options = {}) {
        return new task_upgrade_1.TaskUpgrade(target, options);
    }
    static withdraw(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new task_withdraw_1.TaskWithdraw(target, resourceType, amount, options);
    }
    static withdrawAll(target, options = {}) {
        return new task_withdrawAll_1.TaskWithdrawAll(target, options);
    }
}
exports.Tasks = Tasks;
