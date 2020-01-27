import { Task } from '../Task';
export declare type repairTargetType = Structure;
export declare class TaskRepair extends Task {
    static taskName: string;
    target: repairTargetType;
    constructor(target: repairTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0 | -1 | -4 | -6 | -7 | -9 | -11 | -12;
}
