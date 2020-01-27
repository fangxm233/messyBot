/// <reference types="screeps" />
import { Task } from '../Task';
export declare type getRenewedTargetType = StructureSpawn;
export declare class TaskGetRenewed extends Task {
    static taskName: string;
    target: getRenewedTargetType;
    constructor(target: getRenewedTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): ScreepsReturnCode;
}
