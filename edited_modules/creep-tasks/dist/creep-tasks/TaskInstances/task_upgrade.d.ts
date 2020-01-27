/// <reference types="screeps" />
import { Task } from '../Task';
export declare type upgradeTargetType = StructureController;
export declare class TaskUpgrade extends Task {
    static taskName: string;
    target: upgradeTargetType;
    constructor(target: upgradeTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): ScreepsReturnCode;
}
