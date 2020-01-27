/// <reference types="screeps" />
import { Task } from '../Task';
export declare type dismantleTargetType = Structure;
export declare class TaskDismantle extends Task {
    static taskName: string;
    target: dismantleTargetType;
    constructor(target: dismantleTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): CreepActionReturnCode;
}
