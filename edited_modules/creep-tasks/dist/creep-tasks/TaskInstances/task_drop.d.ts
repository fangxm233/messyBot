/// <reference types="screeps" />
import { Task } from '../Task';
export declare type dropTargetType = {
    pos: RoomPosition;
} | RoomPosition;
export declare class TaskDrop extends Task {
    static taskName: string;
    target: null;
    data: {
        resourceType: ResourceConstant;
        amount: number | undefined;
    };
    constructor(target: dropTargetType, resourceType?: ResourceConstant, amount?: number | undefined, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    isValid(): boolean;
    work(): 0 | -1 | -4 | -6;
}
