/// <reference types="screeps" />
import { Task } from '../Task';
export declare type healTargetType = Creep;
export declare class TaskHeal extends Task {
    static taskName: string;
    target: healTargetType;
    constructor(target: healTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): CreepActionReturnCode;
}
