/// <reference types="screeps" />
import { Task } from '../Task';
import { EnergyStructure, StoreStructure } from '../utilities/helpers';
export declare type transferTargetType = EnergyStructure | StoreStructure | StructureLab | StructureNuker | StructurePowerSpawn | Creep;
export declare class TaskTransfer extends Task {
    static taskName: string;
    target: transferTargetType;
    data: {
        resourceType: ResourceConstant;
        amount: number | undefined;
    };
    constructor(target: transferTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): ScreepsReturnCode;
}
