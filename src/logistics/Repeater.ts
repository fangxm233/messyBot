import { profile } from "../profiler/decorator";

@profile
export class Repeater {
    private actions: {[interval: number]: {
        actionThis: any, 
        action: (...arg: any[]) => ScreepsReturnCode,
        fallBack: (actionThis?: any) => any,
    }[]} = {};

    public repeatActions() {
        for (const interval in this.actions) {
            if (this.actions.hasOwnProperty(interval)) {
                const actions = this.actions[interval];
                if(Game.time % (interval! as any) !== 0) continue;
                for (let i = 0; i < actions.length; i++) {
                    const {actionThis, action, fallBack} = actions[i];
                    const code = action.apply(actionThis);
                    if(code !== OK) {
                        fallBack.apply(actionThis, actionThis);
                        actions[i] = undefined as any;
                    }
                }
            }
        }
        // _.forEach(this.actions, (actions, interval) => {
        //     if(Game.time % (interval! as any) !== 0) return;
        //     for (let i = 0; i < actions.length; i++) {
        //         const {actionThis, action, fallBack} = actions[i];
        //         const code = action.apply(actionThis);
        //         if(code !== OK) {
        //             fallBack.apply(actionThis, actionThis);
        //             actions[i] = undefined as any;
        //         }
        //     }
        // });
    }

    public addAction(interval: number, actionThis: any, 
        action: (...arg: any[]) => ScreepsReturnCode,
        fallBack: (actionThis?: any) => any): number {
        if(!this.actions[interval]) this.actions[interval] = [];
        const free = getFreeKey(this.actions[interval]);
        this.actions[interval][free] = {actionThis, action, fallBack};
        return free;
    }

    public removeAction(interval: number, id: number) {
        if(!this.actions[interval]) return;
        this.actions[interval][id] = undefined as any;
    }
}

export function getFreeKey(obj: any, prefix: string = '', suffix: string = ''): number{
	for (let i = 0; i < 9999; i++) {
		if(!obj[prefix + i + suffix]) return i;
	}
	return -1;
}

export const repeater = new Repeater();
(global as any).repeater = repeater;