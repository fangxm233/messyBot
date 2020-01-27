import { Task } from '../Task';
export declare type attackTargetType = Creep | Structure;
export declare class TaskAttack extends Task {
    static taskName: string;
    target: attackTargetType;
    constructor(target: attackTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): number;
}
