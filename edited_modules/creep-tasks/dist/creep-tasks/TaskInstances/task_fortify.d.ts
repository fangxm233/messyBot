/// <reference types="screeps" />
import { Task } from '../Task';
export declare type fortifyTargetType = StructureWall | StructureRampart;
export declare class TaskFortify extends Task {
    static taskName: string;
    target: fortifyTargetType;
    constructor(target: fortifyTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0 | -1 | -4 | -6 | -7 | -9 | -11 | -12;
}
