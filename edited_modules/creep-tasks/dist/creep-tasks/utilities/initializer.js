"use strict";
// Reinstantiation of a task object from protoTask data
Object.defineProperty(exports, "__esModule", { value: true });
const task_attack_1 = require("../TaskInstances/task_attack");
const task_build_1 = require("../TaskInstances/task_build");
const task_claim_1 = require("../TaskInstances/task_claim");
const task_dismantle_1 = require("../TaskInstances/task_dismantle");
const task_fortify_1 = require("../TaskInstances/task_fortify");
const task_getBoosted_1 = require("../TaskInstances/task_getBoosted");
const task_getRenewed_1 = require("../TaskInstances/task_getRenewed");
const task_goTo_1 = require("../TaskInstances/task_goTo");
const task_goToRoom_1 = require("../TaskInstances/task_goToRoom");
const task_harvest_1 = require("../TaskInstances/task_harvest");
const task_heal_1 = require("../TaskInstances/task_heal");
const task_meleeAttack_1 = require("../TaskInstances/task_meleeAttack");
const task_pickup_1 = require("../TaskInstances/task_pickup");
const task_rangedAttack_1 = require("../TaskInstances/task_rangedAttack");
const task_withdraw_1 = require("../TaskInstances/task_withdraw");
const task_repair_1 = require("../TaskInstances/task_repair");
const task_reserve_1 = require("../TaskInstances/task_reserve");
const task_signController_1 = require("../TaskInstances/task_signController");
const task_transfer_1 = require("../TaskInstances/task_transfer");
const task_upgrade_1 = require("../TaskInstances/task_upgrade");
const task_drop_1 = require("../TaskInstances/task_drop");
const helpers_1 = require("./helpers");
const task_invalid_1 = require("../TaskInstances/task_invalid");
const task_transferAll_1 = require("../TaskInstances/task_transferAll");
const task_withdrawAll_1 = require("../TaskInstances/task_withdrawAll");
function initializeTask(protoTask) {
    // Retrieve name and target data from the protoTask
    let taskName = protoTask.name;
    let target = helpers_1.deref(protoTask._target.ref);
    let task;
    // Create a task object of the correct type
    switch (taskName) {
        case task_attack_1.TaskAttack.taskName:
            task = new task_attack_1.TaskAttack(target);
            break;
        case task_build_1.TaskBuild.taskName:
            task = new task_build_1.TaskBuild(target);
            break;
        case task_claim_1.TaskClaim.taskName:
            task = new task_claim_1.TaskClaim(target);
            break;
        case task_dismantle_1.TaskDismantle.taskName:
            task = new task_dismantle_1.TaskDismantle(target);
            break;
        case task_drop_1.TaskDrop.taskName:
            task = new task_drop_1.TaskDrop(helpers_1.derefRoomPosition(protoTask._target._pos));
            break;
        case task_fortify_1.TaskFortify.taskName:
            task = new task_fortify_1.TaskFortify(target);
            break;
        case task_getBoosted_1.TaskGetBoosted.taskName:
            task = new task_getBoosted_1.TaskGetBoosted(target, protoTask.data.resourceType);
            break;
        case task_getRenewed_1.TaskGetRenewed.taskName:
            task = new task_getRenewed_1.TaskGetRenewed(target);
            break;
        case task_goTo_1.TaskGoTo.taskName:
            task = new task_goTo_1.TaskGoTo(helpers_1.derefRoomPosition(protoTask._target._pos));
            break;
        case task_goToRoom_1.TaskGoToRoom.taskName:
            task = new task_goToRoom_1.TaskGoToRoom(protoTask._target._pos.roomName);
            break;
        case task_harvest_1.TaskHarvest.taskName:
            task = new task_harvest_1.TaskHarvest(target);
            break;
        case task_heal_1.TaskHeal.taskName:
            task = new task_heal_1.TaskHeal(target);
            break;
        case task_meleeAttack_1.TaskMeleeAttack.taskName:
            task = new task_meleeAttack_1.TaskMeleeAttack(target);
            break;
        case task_pickup_1.TaskPickup.taskName:
            task = new task_pickup_1.TaskPickup(target);
            break;
        case task_rangedAttack_1.TaskRangedAttack.taskName:
            task = new task_rangedAttack_1.TaskRangedAttack(target);
            break;
        case task_repair_1.TaskRepair.taskName:
            task = new task_repair_1.TaskRepair(target);
            break;
        case task_reserve_1.TaskReserve.taskName:
            task = new task_reserve_1.TaskReserve(target);
            break;
        case task_signController_1.TaskSignController.taskName:
            task = new task_signController_1.TaskSignController(target);
            break;
        case task_transfer_1.TaskTransfer.taskName:
            task = new task_transfer_1.TaskTransfer(target);
            break;
        case task_transferAll_1.TaskTransferAll.taskName:
            task = new task_transferAll_1.TaskTransferAll(target);
            break;
        case task_upgrade_1.TaskUpgrade.taskName:
            task = new task_upgrade_1.TaskUpgrade(target);
            break;
        case task_withdraw_1.TaskWithdraw.taskName:
            task = new task_withdraw_1.TaskWithdraw(target);
            break;
        case task_withdrawAll_1.TaskWithdrawAll.taskName:
            task = new task_withdrawAll_1.TaskWithdrawAll(target);
            break;
        default:
            console.log(`Invalid task name: ${taskName}! task.creep: ${protoTask._creep.name}. Deleting from memory!`);
            task = new task_invalid_1.TaskInvalid(target);
            break;
    }
    // Set the task proto to what is in memory
    task.proto = protoTask;
    // Return it
    return task;
}
exports.initializeTask = initializeTask;
