/**********************************************

author：ChenyangDu
version:1.1

lab半自动

使用方法：
1、需要占用Memory.lab，不要和其他代码冲突
2、需要手动提供原矿或者其他中间产物,提前放在房间的storage 或者terminal里面都行
    比如想生产1000 XGH2O，可以准备1000 X, 1000 G, 1000 O, 2000 H
    也可以准备500 GH2O, 1000 X, 500 GH, 500 OH
    总之能合成就行
3、storage不要满，要不没地方放产物
4、尽量科学摆放LAB（有两个lab离其他lab的距离<=2），代码会自动寻找生产效率最大的方式

代码部分如下

var labCtrl = require('labCtrl')

module.exports.loop = function () {

    labCtrl.run('W43N27',RESOURCE_GHODIUM,2000)

    //your code

}

***************************************************/

import { RoomPlanner } from "../roomPlanner/RoomPlanner";

const STATE_FILL = 0
const STATE_REACTION = 1
const STATE_RECOVERY = 2

const body = [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,
    CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,];
//lab专用creep的身体部件，如果嫌多，或者嫌少，自行调整


var room,needs,labs,creep

module.exports = {
    run:function(roomName,need_type,need_amount){
        room = Game.rooms[roomName];
        const creepName = 'laber' + roomName;
        creep = Game.creeps[creepName];
        if(!initMemory(roomName)) return;//这句是初始化用的，如果目标房间已经运行稳定了，就可以把这句删掉
        if(!need_type || !need_amount){
            console.log(`ERROR: What do you want Room ${roomName} do?`)
            return;
        }
        var state = Memory.lab[roomName].state;
        labs = new Array();
        var _id = 0;
        
        let rp = new RoomPlanner(roomName);
        let sourceLabs = rp.getMineralLabs();
        if(sourceLabs.length < 2) return;
        labs.push(...sourceLabs);
        labs.push(...rp.getProductLabs());
        // Memory.lab[roomName]['labs'].forEach(labid => {
        //     labs.push(Game.getObjectById(labid))
        //     new RoomVisual(roomName).text(_id,labs[_id].pos,{color: 'white', font: 0.5})//如不需要绘制编号，这句也可以删了
        //     _id++;
        // });
        
        needs = new Array();
        //needs.push([need_type,need_amount]);
        pushMission([need_type,need_amount],roomName,0)
        // console.log(needs)
        if(needs.length >= 1){
            var product = needs[needs.length-1][0],amount = Math.min(3000, needs[needs.length-1][1]);
            var materials = findMaterial(product)
        }
        if(amount % 5)amount += 5-amount%5;
        //console.log(materials)
        if(materials == null && needs.length >= 1){
            console.log('Room '+roomName+' need '+ amount + product)
        }
        if(materials == null){
            if(creep)
                creepKill(creep)
            return
        }

        //change state 

        if(state == STATE_REACTION && (labs[0].mineralType == undefined || labs[1].mineralType == undefined)){
            console.log('state change to STATE_RECOVERY')
            state = STATE_RECOVERY
        }
        if(state == STATE_RECOVERY){
            var allclear = true;
            labs.forEach(lab => {
                if(lab.mineralType != undefined)allclear = false;
            });
            if(allclear){
                console.log('state change to STATE_FILL')
                state = STATE_FILL
            }
        }
        if(state == STATE_FILL){
            if(labs[0].store[materials[0]] >= amount && labs[1].store[materials[1]] >= amount){
                console.log('state change to STATE_REACTION')
                state = STATE_REACTION
            }
        }
        Memory.lab[roomName].state = state;
        //console.log('state is ',state)
        // run state
        
        if(creep)creep.say('laber')
        if(state == STATE_REACTION && Game.time % REACTION_TIME[product] == 0){
            if(creep){
                creepKill(creep)
            }
            for(var i = 2;i<labs.length;i++){
                if(labs[0] && labs[1] && labs[i]){
                    if(labs[i].runReaction(labs[0],labs[1]) != OK){
                        //console.log('wa')
                        state = STATE_RECOVERY;
                    }
                }
            }
        }
        else if(state == STATE_FILL){
            if(!creep){
                autoSpawnCreep(creepName)
            }else{
                var withdrawTarget;
                var type = materials[0]
                //console.log(labs[0].store[type])
                if(labs[0].store[type] ==undefined || labs[0].store[type] < amount){
                    if(room.storage.store[type])withdrawTarget = room.storage;
                    else if(room.terminal.store[type])withdrawTarget = room.terminal;
                    if(labs[0].store[type])amount -= labs[0].store[type];
                    if(creep.store[type] >= amount)withdrawTarget = null;
                    //console.log(withdrawTarget,type,amount)
                    WAT(creep,withdrawTarget,labs[0],type,amount)
                }else{
                    type = materials[1]
                    if(labs[1].store[type] ==undefined || labs[1].store[type] < amount){
                        if(room.storage.store[type])withdrawTarget = room.storage;
                        else if(room.terminal.store[type])withdrawTarget = room.terminal;
                        if(labs[1].store[type])amount -= labs[1].store[type];
                        WAT(creep,withdrawTarget,labs[1],type,amount)
                    }
                }
            }
        }else if(state == STATE_RECOVERY){
            if(!creep){
                autoSpawnCreep(creepName)
            }else{
                var mission = false;
                labs.forEach(lab => {
                    if(mission == false && lab.mineralType){
                        WAT(creep,lab,room.storage,lab.mineralType,3000)
                        mission = true;
                    }
                });
            }
        }

    }
};

function initMemory(roomName){
    if(!Memory.lab){
        Memory.lab = {}
    }
    if(!Memory.lab[roomName]){
        Memory.lab[roomName] = {}
    }
    if(Memory.lab[roomName].state === undefined){
        Memory.lab[roomName].state = STATE_REACTION
    }
    if(Memory.lab[roomName].labs) delete Memory.lab[roomName].labs;
    return true;
    // if(!Memory.lab[roomName].labs || Game.time % 3 == 0){
    //     var labs = room.find(FIND_STRUCTURES,{filter:o=>(o.structureType == STRUCTURE_LAB)})
    //     labs.forEach(lab => {
    //         lab.value = 0;
    //         labs.forEach(l => {
    //             if(lab.pos.inRangeTo(l,2)){
    //                 lab.value ++;
    //             }
    //         });
    //     });
    //     labs.sort((a,b)=>(b.value - a.value));
    //     for(var i = 0;i<labs.length;i++){
    //         labs[i] = labs[i].id;
    //     }
    //     Memory.lab[roomName].labs = labs;
    // }
    // if(Memory.lab[roomName].labs.length >= 3){
    //     return true;
    // }else{
    //     console.log('ERROR: Room '+roomName+' must have more than 3 labs');
    //     return false;
    // }
}

function findMaterial(product){
    for(var i in REACTIONS){
        for(var j in REACTIONS[i]){
            if(REACTIONS[i][j] == product){
                return [i,j]
            }
        }
    }
    return null
}
function getAvaliableSpawn(room){
    for (var spawnname in Game.spawns){
        var spawn = Game.spawns[spawnname]
        if(spawn.room.name == room && spawn.spawning == null){
            return spawn
        }
    }
    return null;
}
function creepKill(creep){
    creep.suicide();
}
function WAT(creep,withdrawTarget,transferTarget,type,amount){
    //console.log(creep.store[type])
    if(_.sum(creep.store) && creep.store[type] != _.sum(creep.store)){
        //console.log(creep.store[type] , _.sum(creep.store),type)
        creep.travelTo(creep.room.storage)
        if(creep.pos.isNearTo(creep.room.storage)){
            for (var resourceType in creep.store){
                if(resourceType != type){
                    creep.transfer(creep.room.storage,resourceType)
                }
            }
        }
        return;
    }
    amount = Math.min(amount,creep.store.getFreeCapacity(type));
    //console.log('amount',amount)
    if(_.sum(creep.store) == 0){
        amount = Math.min(amount,withdrawTarget.store[type]);
        creep.travelTo(withdrawTarget)
        if(creep.pos.isNearTo(withdrawTarget)){
            creep.withdraw(withdrawTarget,type,amount)
        }
    }else{
        //console.log(withdrawTarget,creep.store.getFreeCapacity(type),withdrawTarget.store[type])
        if(withdrawTarget && creep.store[type] < amount && creep.store.getFreeCapacity(type) > 0 && withdrawTarget.store[type] > 0){
            amount = Math.min(amount,creep.store.getFreeCapacity(type),withdrawTarget.store[type]);
            creep.travelTo(withdrawTarget)
            if(creep.pos.isNearTo(withdrawTarget)){
                creep.withdraw(withdrawTarget,type,amount)
            }
        }else{
            creep.travelTo(transferTarget)
            if(creep.pos.isNearTo(transferTarget)){
                creep.transfer(transferTarget,type)
            }
        }
    }
}

function autoSpawnCreep(creepName){
    var spawn = getAvaliableSpawn(room.name)
    if(spawn){
        spawn.spawnCreep(body,creepName)
    }
}
function getAllType(type){
    var amount = 0;
    amount += room.storage.store[type] || 0
    amount += room.terminal.store[type] || 0
    labs.forEach(lab => {
        amount += lab.store[type] || 0;
    });
    if(creep)
        amount += creep.store[type] || 0
    
    return amount;
}
function pushMission(mission,roomName,depth){
    mission[1] -= getAllType(mission[0])
    if(mission[1] <= 0)return;
    else {
        if(depth === 0) mission[1] = Math.min(mission[1], 3000)
        needs.push(mission)
        var materials = findMaterial(mission[0])
        if(materials){
            pushMission([materials[0],mission[1]],roomName,depth+1)
            pushMission([materials[1],mission[1]],roomName,depth+1)
        }
    }
}