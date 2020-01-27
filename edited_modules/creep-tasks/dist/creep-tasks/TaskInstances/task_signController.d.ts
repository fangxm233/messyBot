/// <reference types="screeps" />
import { Task } from '../Task';
export declare type signControllerTargetType = StructureController;
export declare class TaskSignController extends Task {
    static taskName: string;
    target: signControllerTargetType;
    data: {
        signature: string;
    };
    constructor(target: signControllerTargetType, signature?: string, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0 | -4 | -7 | -9;
}
