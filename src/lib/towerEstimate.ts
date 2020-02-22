import { possibleTowerDamage } from "../utils";

/*

author：ChenyangDu
功能：绘制塔的伤害，以百为单位，需要配合observe，注意避免和observe代码冲突
提示：特别费CPU，随用随停，建议就运行1tick，然后截屏下来研究

使用示例
let towerEstimate = require('towerEstimate')
towerEstimate.run('W1N2','W3N7')
*/

let cachedResult = {};

export class towerEstimate {
    static run(mainRoomName, observeRoomName) {
        if(cachedResult[observeRoomName]) {
            this.display(observeRoomName);
            return;
        }
        const mainRoom = Game.rooms[mainRoomName]
        const observeRoom = Game.rooms[observeRoomName]
        if (!mainRoom) return;
        const observer = mainRoom.observer
        if (!observer) return;
        observer.observeRoom(observeRoomName)
        if (!observeRoom) return;

        let result = {};
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                let attack = possibleTowerDamage(observeRoom, new RoomPosition(x, y, observeRoomName));
                result[`${x}:${y}`] = attack;
                // new RoomVisual(pos.roomName).text((attack / 100) + '', x, y, { font: 0.4, color: color })
            }
        }
        cachedResult[observeRoomName] = result;
        this.display(observeRoomName);
    }

    static display(observeRoomName) {
        let matrix = cachedResult[observeRoomName];
        if(!matrix) return;
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                let damage = matrix[`${x}:${y}`];
                let color = this.getColor(damage);
                new RoomVisual(observeRoomName).text((damage / 100) + '', x, y, { font: 0.4, color: color });
            }
        }
    }

    static getColor(damage) {
        let color = "#00ff00";
        if (damage >= 1575) color = "#88ff00";
        if (damage >= 2250) color = "#ffff00";
        if (damage >= 2925) color = "#ff8800";
        if (damage >= 3600) color = "#ff0000";
        return color;
    }
}