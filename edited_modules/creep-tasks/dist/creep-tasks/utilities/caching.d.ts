export declare class TargetCache {
    targets: {
        [ref: string]: string[];
    };
    tick: number;
    constructor();
    private cacheTargets;
    static assert(): void;
    build(): void;
}
