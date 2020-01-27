/// <reference types="screeps" />
import { Task } from '../Task';
export declare type meleeAttackTargetType = Creep | Structure;
export declare class TaskMeleeAttack extends Task {
    static taskName: string;
    target: meleeAttackTargetType;
    constructor(target: meleeAttackTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): CreepActionReturnCode;
}
