/// <reference types="screeps" />
import { Task } from '../Task';
export declare type claimTargetType = StructureController;
export declare class TaskClaim extends Task {
    static taskName: string;
    target: claimTargetType;
    constructor(target: claimTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0 | -1 | -4 | -7 | -8 | -9 | -11 | -12 | -15;
}
