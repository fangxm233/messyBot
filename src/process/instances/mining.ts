import { Process } from "../process";
import { RoleMiner } from "../../roles/miner";
import { RoleTransporter } from "../../roles/transporter";
import { CreepWish } from "../../programs/creepWish";
import { profile } from "../../profiler/decorator";

@profile
export class ProcessMining extends Process{
    container: StructureContainer;
    extractor: StructureExtractor;
    mineral: Mineral;

    constructor(roomName: string){
        super(roomName, 'mining');
    }

    check(): boolean{
        if(!this.container || !this.mineral || !this.extractor){
            let room = Game.rooms[this.roomName];
            if(!this.container) this.container = Game.getObjectById(room.memory.mineral.containerId) as any;
            if(!this.mineral) this.mineral = Game.getObjectById(room.memory.mineral.mineralId) as any;
            if(!this.extractor) this.extractor = Game.getObjectById(room.memory.mineral.extractorId) as any;
            return false;
        }
        return true;
    }

    run(){
        let room = Game.rooms[this.roomName];
        if(!this.container) this.container = Game.getObjectById(room.memory.mineral.containerId) as any;
        this.mineral = Game.getObjectById(room.memory.mineral.mineralId) as any;
        if(!this.extractor) this.extractor = Game.getObjectById(room.memory.mineral.extractorId) as any;

        if(!this.container || !this.mineral || !this.extractor){
            this.suspend();
            return;
        }

        this.foreachCreep(this.runCreep);

        if(this.mineral.mineralAmount == 0){
            let creeps = _.groupBy(_.map(this.creeps, creep => Game.creeps[creep]), creep => creep.memory.role);
            let transporter = creeps['transporter'][0];
            
            if(!transporter || !transporter.store[this.mineral.mineralType]){
                this.sleep(this.mineral.ticksToRegeneration);
                return;
            }
        }else if(this.creeps.length < 2){
            let creeps = _.groupBy(_.map(this.creeps, creep => Game.creeps[creep]), creep => creep.memory.role);
            if(creeps['transporter'].length == 0) CreepWish.wishCreep(this.roomName, 'transporter', this.fullId);
        }
    }

    runCreep(creep: Creep){
        if(creep.memory.role == 'miner'){
            // new RoleMiner(creep).run(this.mineral, this.extractor, this.container);
        }
        if(creep.memory.role == 'transporter'){
            new RoleTransporter(creep).run();
        }
    }
}