import { Task } from '../Task';
export declare type goToRoomTargetType = string;
export declare class TaskGoToRoom extends Task {
    static taskName: string;
    target: null;
    constructor(roomName: goToRoomTargetType, options?: TaskOptions);
    isValidTask(): boolean;
    isValidTarget(): boolean;
    isValid(): boolean;
    work(): 0;
}
