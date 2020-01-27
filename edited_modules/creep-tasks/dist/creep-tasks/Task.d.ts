/**
 * Creep tasks setup instructions
 *
 * Javascript:
 * 1. In main.js:    require("creep-tasks");
 * 2. As needed:     var Tasks = require("<path to creep-tasks.js>");
 *
 * Typescript:
 * 1. In main.ts:    import "<path to index.ts>";
 * 2. As needed:     import {Tasks} from "<path to Tasks.ts>"
 *
 * If you use Traveler, change all occurrences of creep.moveTo() to creep.travelTo()
 */
export declare type targetType = {
    ref: string;
    pos: RoomPosition;
};
export declare abstract class Task implements ITask {
    static taskName: string;
    name: string;
    _creep: {
        name: string;
    };
    _target: {
        ref: string;
        _pos: protoPos;
    };
    _parent: protoTask | null;
    tick: number;
    settings: TaskSettings;
    options: TaskOptions;
    data: TaskData;
    constructor(taskName: string, target: targetType, options?: TaskOptions);
    proto: protoTask;
    creep: Creep;
    readonly target: RoomObject | null;
    readonly targetPos: RoomPosition;
    parent: Task | null;
    readonly manifest: Task[];
    readonly targetManifest: (RoomObject | null)[];
    readonly targetPosManifest: RoomPosition[];
    fork(newTask: Task): Task;
    abstract isValidTask(): boolean;
    abstract isValidTarget(): boolean;
    isValid(): boolean;
    moveToTarget(range?: number): number;
    moveToNextPos(): number | undefined;
    readonly eta: number | undefined;
    run(): number | undefined;
    protected parkCreep(creep: Creep, pos?: RoomPosition, maintainDistance?: boolean): number;
    abstract work(): number;
    finish(): void;
}
