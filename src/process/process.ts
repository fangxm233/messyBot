import { profile } from "../profiler/decorator";

type ProcessState = 'sleeping' | 'active' | 'suspended';

@profile
export class Process{

    /** use short ID */
    static processes: {
        [roomName: string]: {
            [processId: string]: Process
        };
    } = {};

    /** use full ID */
    static processes_ID: {
        [processId: string]: Process;
    } = {};

    /** use fill ID */
    static process_Type: {
        [processName: string]: {
            [processId: string]: Process;
        }
    } = {};

    roomName: string;
    processName: string;
    creeps: string[] = [];
    id: number;

    private _state: ProcessState;
    public set state(v : ProcessState) {
        this._state = v;
        this.memory.state = v;
    }
    public get state() : ProcessState {
        return this._state;
    }
    
    private _sleepTime: number = 0
    public set sleepTime(v : number) {
        this._sleepTime = v;
        this.memory.slt = v;
    }
    public get sleepTime() : number {
        return this._sleepTime;
    }

    private _fullId: string;
    public get fullId(): string{
        return this._fullId ? this._fullId : this._fullId = this.getId();
    }

    memory: ProcessInterface;

    constructor(roomName: string, processName: string){
        this.roomName = roomName;
        this.processName = processName;
        this._state = 'active';
    }

    public registerCreep(creepName: string){
        this.creeps.push(creepName);
        console.log('same', this.creeps == this.memory.creeps)
        if(this.creeps != this.memory.creeps) this.memory.creeps.push(creepName);
        console.log(this.roomName, this.processName, this.id, 'register', creepName);
    }
    public removeCreep(creepName: string){
        _.pull(this.creeps, creepName);
        console.log('same', this.creeps == this.memory.creeps)
        if(this.creeps != this.memory.creeps) _.pull(this.memory.creeps, creepName);
        console.log(this.roomName, this.processName, this.id, 'remove', creepName);
    }

    getId(): string {
        return `${this.roomName}_${this.id}`;
    }

    getStruct(): ProcessInterface {
        return {
            name: this.processName,
            state: this.state,
            slt: this.sleepTime,
            creeps: this.creeps,
        }
    }

    awake(){
        this.state = 'active';
        this.sleepTime = 0;
        console.log(this.roomName, this.processName, this.id, 'active');
    }
    sleep(time: number, removeAllCreeps?: boolean){
        this.state = 'sleeping';
        this.sleepTime = time;

        if(removeAllCreeps) this.foreachCreep(creep => this.removeCreep(creep.name));

        console.log(this.roomName, this.processName, this.id, 'sleeping', time);
    }
    suspend(){
        this.state = 'suspended';
        console.log(this.roomName, this.processName, this.id, 'suspended');
    }
    close(){
        Memory.processes[this.roomName][this.id] = undefined as any;
        Process.processes[this.roomName][this.id] = undefined as any;
        Process.processes_ID[this.fullId] = undefined as any;
        Process.process_Type[this.processName][this.fullId] = undefined as any;
        console.log(this.roomName, this.processName, this.id, 'close');
    }

    check(): boolean{
        return true;
    }
    run() {}
    foreachCreep(callbackfn: (creep: Creep) => void){
        for (let i = 0; i < this.creeps.length; i++) {
            const creepName = this.creeps[i];
            if(!Game.creeps[creepName]) {
                console.log('Clearing non-existing creep memory:', creepName);
                delete Memory.creeps[creepName];        
                this.removeCreep(creepName);
                i--;
                continue;
            }
            // if(Game.creeps[creepName].memory.spawnRoom != this.roomName) {
            //     console.log('c', Game.creeps[creepName].memory.spawnRoom, 'p', this.roomName, 'cn', creepName);
            //     this.removeCreep(creepName);
            //     i--;
            //     continue;
            // }
            callbackfn(Game.creeps[creepName]);
        }
    }

    boostedCreep(creepName: string, compoundTypes: ResourceConstant[]) {}

    static getInstance(struct: ProcessInterface, roomName): Process {
        return new Process(roomName, struct.name);
    }

    static getProcess(Id: string): Process | undefined;
    static getProcess(roomName: string, type: string): Process | undefined;
    static getProcess(roomName: string, processName: string, key: string, value: any): Process | undefined;

    static getProcess(a1: string, a2?: string, a3?: string, a4?: any): Process | undefined {
        if(a4 !== undefined && a3 !== undefined) {
            return _.find(this.processes[a1], process => process && process.processName == a2 && process[a3] === a4);
        }

        if(a2 !== undefined) {
            return _.find(this.process_Type[a2], process => process && process.roomName == a1);
        }

        return this.processes_ID[a1];
    }
    // static getProcessById(Id: string): Process | undefined{
    //     return this.processes_ID[Id];
    // }
    
    // static getProcessByType(roomName: string, type: string): Process | undefined{
    //     if(!this.processes[roomName]) return undefined;
    //     let processes = this.processes[roomName];
    //     return _.find(processes, process => process.processName == type);
    // }

    // static getProcessByContent(roomName: string, name: string, key: string, value: any): Process | undefined{
    //     if(!this.processes[roomName]) return undefined;
    //     let processes = this.processes[roomName];
    //     return _.find(processes, process => process.processName == name && process[key] === value);
    // }

    static startProcess(process: Process): string{
        if(!this.processes[process.roomName]) this.processes[process.roomName] = {};
        if(!Memory.processes[process.roomName]) Memory.processes[process.roomName] = [];
        if(!this.process_Type[process.processName]) this.process_Type[process.processName] = {};
        
        let free = this.getFreeIndex(Memory.processes[process.roomName]);
        process.id = free;
        this.processes[process.roomName][free] = process;
        this.processes_ID[process.fullId] = process;
        this.process_Type[process.processName][process.fullId] = process;
        Memory.processes[process.roomName][free] = process.getStruct();
        process.memory = Memory.processes[process.roomName][free];
        console.log(process.roomName, 'process', process.processName, process.id, 'started');
        return process.fullId;
    }
    static addProcess(process: Process){
        if(!this.processes[process.roomName]) this.processes[process.roomName] = {};
        this.processes[process.roomName][process.id] = process;
        this.processes_ID[process.fullId] = process;
        this.process_Type[process.processName][process.fullId] = process;
        // _.forEach(this.process_Type['boost'], process => console.log(process.memory))
        console.log(process.roomName, 'process', process.processName, process.id, 'added');
    }

    private static getFreeIndex(obj: any): number{
        for (let i = 0; i < 999; i++) {
            if(!obj[i]) return i;
        }
        return -1;
    }

    static runAllProcesses(){
        let cpuUesd: {[type: string]: {num: number, cpu: number}} = {};

        for (const processName in this.process_Type) {
            const processes = this.process_Type[processName];
            _.forEach(processes, process => {
                if(!process) return;
                process.memory = Memory.processes[process.roomName][process.id];
                // if(process.processName == 'boost') console.log(process.memory)
                switch (process.state) {
                    case 'sleeping':
                        process.sleepTime--;
                        if(process.sleepTime <= -1) {
                            process.awake();
                            process.run();
                        }
                        break;
                    case 'active':
                        // if(!cpuUesd[process.processName]) cpuUesd[process.processName] = {num: 0, cpu: 0};
                        // let cpu = Game.cpu.getUsed();
                        process.run();
                        // cpuUesd[process.processName].cpu += Game.cpu.getUsed() - cpu;
                        // cpuUesd[process.processName].num++;
                        break;
                    case 'suspended':
                        if(process.check()) {
                            process.awake();
                            process.run();
                        }
                        break;
                }
            })
        };
        // let strings: string[] = [];
        // _.forEach(cpuUesd, (used, key) => {
        //     strings.push([`name: ${key}`, `total: ${used.cpu.toFixed(3)}`, `avg: ${(used.cpu / used.num).toFixed(3)}`, `num: ${used.num}`].join('\t'));
        // });
        // console.log(strings.join('\n'));
    }
}
