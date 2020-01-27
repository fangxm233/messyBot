/// <reference types="screeps" />
import { Task } from '../Task';
import { EnergyStructure, StoreStructure } from '../utilities/helpers';
export declare type withdrawTargetType = EnergyStructure | StoreStructure | StructureLab | StructureNuker | StructurePowerSpawn | Tombstone;
export declare class TaskWithdraw extends Task {
    static taskName: string;
    target: withdrawTargetType;
    data: {
        resourceType: ResourceConstant;
        amount: number | undefined;
    };
    constructor(target: withdrawTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): ScreepsReturnCode;
}
