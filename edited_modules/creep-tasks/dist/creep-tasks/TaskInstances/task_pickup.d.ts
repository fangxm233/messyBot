/// <reference types="screeps" />
import { Task } from '../Task';
export declare type pickupTargetType = Resource;
export declare class TaskPickup extends Task {
    static taskName: string;
    target: pickupTargetType;
    constructor(target: pickupTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0 | -1 | -4 | -7 | -8 | -9 | -11 | -12;
}
