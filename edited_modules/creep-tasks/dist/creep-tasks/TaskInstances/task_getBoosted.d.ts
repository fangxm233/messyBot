/// <reference types="screeps" />
import { Task } from '../Task';
export declare const MIN_LIFETIME_FOR_BOOST = 0.9;
export declare type getBoostedTargetType = StructureLab;
export declare class TaskGetBoosted extends Task {
    static taskName: string;
    target: getBoostedTargetType;
    data: {
        resourceType: _ResourceConstantSansEnergy;
        amount: number | undefined;
    };
    constructor(target: getBoostedTargetType, boostType: _ResourceConstantSansEnergy, partCount?: number | undefined, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): ScreepsReturnCode;
}
