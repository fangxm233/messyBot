import { Process } from "../../process/process";
import { profile } from "../../profiler/decorator";
import { CreepWish } from "../../programs/creepWish";
import { RoleDefencer } from "../../roles/defencer";
import { RoleFactory } from "../../roles/roleFactory";

@profile
export class ProcessDefend extends Process{
    memory: ProcessDefendInterface;

    targetName: string;
    type: 'creep' | 'coreDis';

    constructor(roomName: string, targetName: string, type: 'creep' | 'coreDis'){
        super(roomName, 'defend');
        this.targetName = targetName;
        this.type = type;
    }

    static getInstance(struct: ProcessDefendInterface, roomName: string): ProcessDefend{
        return new ProcessDefend(roomName, struct.tgt, struct.type);
    }

    run(){
        this.foreachCreep(()=>{});

        let invaders: Creep[] = [];
        let wounded: Creep[] = [];
        let room = Game.rooms[this.targetName];
        if(room){
            if(this.type == 'creep'){
                invaders = room.find(FIND_HOSTILE_CREEPS);
                wounded = room.find(FIND_MY_CREEPS, { filter: creep => creep.hits < creep.hitsMax });
                if(!invaders.length && !wounded.length) this.close();    
            }
            if(this.type == 'coreDis'){
                if(!room.find(FIND_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_INVADER_CORE}).length) this.close();
            }
        }

        if(this.creeps.length == 0) CreepWish.wishCreep(this.roomName, this.type == 'creep' ? 'defencer' : 'coreDis', this.fullId);

        this.foreachCreep(creep => this.runCreep(creep, invaders, wounded));
    }

    runCreep(creep: Creep, invaders: Creep[], wounded: Creep[]){
        let role = RoleFactory.getRole(creep, creep => new RoleDefencer(creep, this.targetName, this.type)) as RoleDefencer;
        role.invaders = invaders;
        role.wounded = wounded;
        role.run();
    }

    getStruct(): ProcessDefendInterface{
        return _.merge(super.getStruct(), { tgt: this.targetName, type: this.type});
    }

    close(){
        this.foreachCreep(creep => creep.suicide());
        super.close();
    }
}