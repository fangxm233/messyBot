"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Task_1 = require("../Task");
const helpers_1 = require("../utilities/helpers");
class TaskTransfer extends Task_1.Task {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        super(TaskTransfer.taskName, target, options);
        // Settings
        this.settings.oneShot = true;
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }
    isValidTask() {
        let amount = this.data.amount || 1;
        let resourcesInCarry = this.creep.carry[this.data.resourceType] || 0;
        return resourcesInCarry >= amount;
    }
    isValidTarget() {
        let amount = this.data.amount || 1;
        let target = this.target;
        if (target instanceof Creep) {
            return _.sum(target.carry) <= target.carryCapacity - amount;
        }
        else if (helpers_1.isStoreStructure(target)) {
            return _.sum(target.store) <= target.storeCapacity - amount;
        }
        else if (helpers_1.isEnergyStructure(target) && this.data.resourceType == RESOURCE_ENERGY) {
            return target.energy <= target.energyCapacity - amount;
        }
        else {
            if (target instanceof StructureLab) {
                return (target.mineralType == this.data.resourceType || !target.mineralType) &&
                    target.mineralAmount <= target.mineralCapacity - amount;
            }
            else if (target instanceof StructureNuker) {
                return this.data.resourceType == RESOURCE_GHODIUM &&
                    target.ghodium <= target.ghodiumCapacity - amount;
            }
            else if (target instanceof StructurePowerSpawn) {
                return this.data.resourceType == RESOURCE_POWER &&
                    target.power <= target.powerCapacity - amount;
            }
        }
        return false;
    }
    work() {
        return this.creep.transfer(this.target, this.data.resourceType, this.data.amount);
    }
}
TaskTransfer.taskName = 'transfer';
exports.TaskTransfer = TaskTransfer;
