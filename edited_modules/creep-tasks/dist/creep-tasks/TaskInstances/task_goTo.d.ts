import { Task } from '../Task';
export declare type goToTargetType = {
    pos: RoomPosition;
} | RoomPosition;
export declare class TaskGoTo extends Task {
    static taskName: string;
    target: null;
    constructor(target: goToTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    isValid(): boolean;
    work(): 0;
}
