/// <reference types="screeps" />
import { Task } from '../Task';
export declare type withdrawAllTargetType = StructureStorage | StructureTerminal | StructureContainer | Tombstone;
export declare class TaskWithdrawAll extends Task {
    static taskName: string;
    target: withdrawAllTargetType;
    constructor(target: withdrawAllTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): ScreepsReturnCode;
}
