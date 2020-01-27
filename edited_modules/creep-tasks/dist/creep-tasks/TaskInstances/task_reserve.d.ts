/// <reference types="screeps" />
import { Task } from '../Task';
export declare type reserveTargetType = StructureController;
export declare class TaskReserve extends Task {
    static taskName: string;
    target: reserveTargetType;
    constructor(target: reserveTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): CreepActionReturnCode;
}
