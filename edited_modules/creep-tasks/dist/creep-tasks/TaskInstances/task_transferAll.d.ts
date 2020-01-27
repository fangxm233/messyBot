/// <reference types="screeps" />
import { Task } from '../Task';
export declare type transferAllTargetType = StructureStorage | StructureTerminal | StructureContainer;
export declare class TaskTransferAll extends Task {
    static taskName: string;
    target: transferAllTargetType;
    data: {
        skipEnergy?: boolean;
    };
    constructor(target: transferAllTargetType, skipEnergy?: boolean, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): ScreepsReturnCode;
}
