import { GlobalSettings } from "../globalSettings";
import { profile } from "../profiler/decorator";
import { Visualizer } from "./Visualizer";
import { Market } from "../extensions/market";

@profile
export class Statistics {
    /*
    * filler idle time
    * resource usage
    */
    static run(room: Room) {
        if (!Memory.statistics) Memory.statistics = {};
        if (!Memory.statistics[room.name]) Memory.statistics[room.name] = {} as statisticsData;
        // this.visualCreeps(room);
        this.countResourceUsage(room);

        // let s1 = Game.cpu.getUsed();
        // let eventLog = room.find(FIND_MY_CREEPS, {filter: c=>c.hits<c.hitsMax});
        // let s2 = Game.cpu.getUsed();
        // Memory.statistics[room.name].averageParseCost = exponentialMovingAverage(s2-s1, Memory.statistics[room.name].averageParseCost, 20);
        // console.log(room.name + ': ' + (s2 - s1));
        // console.log(room.getEventLog(true));
    }

    static visualCreeps(room: Room) {
        let visual = room.visual;
        let spawn = room.spawns[0];

        let size = 0.4;
        let originY = spawn.pos.y - ((GlobalSettings.roles.length + 1) / 2) * size;
        let total = 0;
        let y = originY;
        for (const role of GlobalSettings.roles) {
            let num = _.filter(Game.creeps, creep => creep.memory.role == role && creep.memory.spawnRoom == room.name).length;
            visual.text(role + ': ' + num, spawn.pos.x + 0.5, y, { font: size, align: 'left' });
            total += num;
            y += size;
        }
        visual.text('total: ' + total, spawn.pos.x + 0.5, y, { font: size, align: 'left' });
    }

    static countResourceUsage(room: Room) {
        let storage = room.storage;
        if (!storage) return;
        let data = Memory.statistics[room.name];
        if (!data.averageResourceUsage) data.averageResourceUsage = 0;
        if (!data.lastReserve) {
            data.lastReserve = storage.store.energy;
            return;
        }
        data.averageResourceUsage = exponentialMovingAverage(storage.store.energy - data.lastReserve, data.averageResourceUsage, 1500);
        data.lastReserve = storage.store.energy;
    }

    static recordCreditChange(){
        if(!Memory.avgCredit) Memory.avgCredit = 0;
        if(!Memory.lastCredit) Memory.lastCredit = Game.market.credits;
        // Memory.changeCredits = Game.market.credits - (Memory.lastTickCredits || Game.market.credits);
        // if(Memory.changeCredits) Memory.lastChangeCredits = Memory.lastTickCredits;
        // Memory.lastTickCredits = Game.market.credits;
        Visualizer.infoBox('Market', ['profit: ' + Memory.avgCredit.toFixed(2)], { x: 9, y: 1}, 6.5);
        let day = new Date().getDate();
        if(day != Memory.day){
            Memory.day = day;
            Memory.avgCredit = exponentialMovingAverage(Game.market.credits - Memory.lastCredit, Memory.avgCredit, 2);
            Memory.lastCredit = Game.market.credits;

            Market.changePrices();
        }
    }
}

/**
 * Compute an exponential moving average
 */
function exponentialMovingAverage(current: number, avg: number | undefined, window: number): number {
    return (current + (avg || 0) * (window - 1)) / window;
}