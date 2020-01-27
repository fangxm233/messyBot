import { Task } from '../Task';
export declare type buildTargetType = ConstructionSite;
export declare class TaskBuild extends Task {
    static taskName: string;
    target: buildTargetType;
    constructor(target: buildTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0 | -1 | -4 | -6 | -7 | -9 | -11 | -12 | -14;
}
