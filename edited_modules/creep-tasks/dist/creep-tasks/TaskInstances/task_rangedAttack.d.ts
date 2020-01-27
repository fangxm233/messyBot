/// <reference types="screeps" />
import { Task } from '../Task';
export declare type rangedAttackTargetType = Creep | Structure;
export declare class TaskRangedAttack extends Task {
    static taskName: string;
    target: rangedAttackTargetType;
    constructor(target: rangedAttackTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): CreepActionReturnCode;
}
