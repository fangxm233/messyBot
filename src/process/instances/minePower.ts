import { Process } from "../process";
import { intel } from "../../programs/Intel";
import { CreepWish } from "../../programs/creepWish";
import { RolePowerAttack } from "../../roles/powerAttack";
import { RolePowerHealer } from "../../roles/powerHealer";
import { RoleTransporter } from "../../roles/transporter";
import { RolePowerRange } from "../../roles/powerRange";
import { profile } from "../../profiler/decorator";
import { RoleFactory } from "../../roles/roleFactory";

@profile
export class ProcessMinePower extends Process{
    memory: ProcessMinePowerInterface;

    targetName: string;

    constructor(roomName: string, targetName: string){
        super(roomName, 'minePower');
        this.targetName = targetName;
    }

    static getInstance(struct: ProcessMinePowerInterface, roomName: string): ProcessMinePower{
        return new ProcessMinePower(roomName, struct.tgt);
    }

    check() {
        if(Game.cpu.bucket > 2500) return true;
        return false;
    }

    run(){
        if(Game.cpu.bucket < 2000) {
            this.suspend();
            return;
        }
        let room = intel[this.targetName];
        this.foreachCreep(()=>{});
        let creeps = _.groupBy(_.map(this.creeps, creepName => Game.creeps[creepName]), creep => creep.memory.role);

        if(room){
            if(!room.powerBank && !room.dropPower && !room.ruin){
                if(!creeps['transporter'] || creeps['transporter'].length == 0) {
                    this.close();
                    return;
                }else{
                    let hasNoPower = true;
                    this.foreachCreep(creep =>{ if(creep.store.power) hasNoPower = false; });
                    if(hasNoPower){
                        this.close();
                        return;
                    }
                    this.foreachCreep((creep) => this.runCreep(creep));
                    return;
                }
            }
            if(room.powerBank){
                this.foreachCreep((creep) => this.runCreep(creep));
                if(!creeps['powerAttack']) CreepWish.wishCreep(this.roomName, 'powerAttack', this.fullId);
                if(!creeps['powerHealer']) CreepWish.wishCreep(this.roomName, 'powerHealer', this.fullId);
                if(!creeps['powerRange']) CreepWish.wishCreep(this.roomName, 'powerRange', this.fullId);
                if(room.powerBank.hits <= 180000) {
                    let num = Math.round(room.powerBank.amount / 1600);
                    if(!creeps['transporter'] || creeps['transporter'].length < num) CreepWish.wishCreep(this.roomName, 'transporter', this.fullId, { target: this.targetName });
                }
                return;
            }
            if(room.dropPower){
                this.foreachCreep((creep) => this.runCreep(creep));
                return;
            }
        } else this.foreachCreep((creep) => this.runCreep(creep));
    }

    runCreep(creep: Creep){
        switch (creep.memory.role) {
            case 'powerAttack':
                let pa = RoleFactory.getRole(creep, creep => new RolePowerAttack(creep, this.targetName)) as RolePowerAttack;
                if(pa) pa.run();
                break;
            case 'powerRange':
                let pr = RoleFactory.getRole(creep, creep => new RolePowerRange(creep, this.targetName)) as RolePowerRange;
                if(pr) pr.run();
                break;
            case "powerHealer":
                let ph = RoleFactory.getRole(creep, creep => new RolePowerHealer(creep, this.targetName)) as RolePowerHealer;
                if(ph) ph.run();
                break;
            case 'transporter':
                let pt = RoleFactory.getRole(creep) as RoleTransporter;
                if(pt) pt.runPowerTransporter();
                break;
            default:
                break;
        }
    }

    getStruct(): ProcessMinePowerInterface{
        return _.merge(super.getStruct(), {tgt: this.targetName})
    }

    close(){
        this.foreachCreep(creep => creep.suicide());
        super.close();
    }
}