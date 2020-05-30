export class CreepWish{
    static wishes:{
        [roomName: string]: {role: string, processId?: string, memory?: any, ratio?: string[]};
    } = {};

    static wishCreep(roomName: string, role: string, processId?: string, memory?: any, ratio?: string[]){
        if(!this.wishes[roomName]) {
            this.wishes[roomName] = { role: role, processId: processId, memory: memory, ratio: ratio };
            return;
        }
        if(rolePriority[this.wishes[roomName].role] > rolePriority[role]) this.wishes[roomName] = { role: role, processId: processId, memory: memory, ratio: ratio };
    }

    static getWish(roomName: string){
        return this.wishes[roomName];
    }

    static clear(roomName: string){
        delete this.wishes[roomName];
    }
}

export const rolePriority: {
    [role: string]: number;
} = {
    filler: 0,
    melee: 1,
    harvester: 2,
    manager: 3,
    transporter: 4,
    shWarrior: 5,
    shHealer: 6,
    shWarrior2: 7,
    healer: 8,
    warrior: 9,
    destroyer: 10,
    repairer: 11,
    rCarrier: 12,
    worker: 13,
    upgrader: 14,
    miner: 15,
    reservist: 16,
    dismantler: 17,
    powerAttack: 18,
    powerHealer: 19,
    powerRange: 20,
    dHarvester: 21,
    contaienr: 22,
    dTransporter: 23,
    defencer: 24,
    coreDis: 25,
    hauler: 26,
    pioneer: 27,
    cAttack: 28,
}