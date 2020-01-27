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
    warrior: 5,
    destroyer: 6,
    healer: 7,
    repairer: 8,
    rCarrier: 9,
    worker: 10,
    upgrader: 11,
    miner: 12,
    reservist: 13,
    dismantler: 14,
    powerAttack: 15,
    powerHealer: 16,
    powerRange: 17,
    dHarvester: 18,
    contaienr: 19,
    dTransporter: 20,
    defencer: 21,
    coreDis: 22,
    hauler: 23,
    pioneer: 24,
}