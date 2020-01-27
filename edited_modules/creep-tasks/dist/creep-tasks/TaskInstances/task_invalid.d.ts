import { Task } from '../Task';
export declare class TaskInvalid extends Task {
    static taskName: string;
    target: any;
    constructor(target: any, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    work(): 0;
}
