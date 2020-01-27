/// <reference types="screeps" />
import { Task } from '../Task';
export declare type harvestTargetType = Source | Mineral;
export declare class TaskHarvest extends Task {
    static taskName: string;
    target: harvestTargetType;
    constructor(target: harvestTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0 | -1 | -4 | -5 | -6 | -7 | -9 | -11 | -12;
}
