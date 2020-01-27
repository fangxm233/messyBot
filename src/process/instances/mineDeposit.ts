import { profile } from "../../profiler/decorator";
import { Process } from "../../process/process";
import { intel } from "../../programs/Intel";
import { CreepWish } from "../../programs/creepWish";
import { RoleDTransporter } from "../../roles/deposit/dTransporter";
import { RoleDHarvester } from "../../roles/deposit/dHarvester";
import { RoleContainer } from "../../roles/deposit/containerCreep";
import { RoleFactory } from "../../roles/roleFactory";

@profile
export class ProcessMineDeposit extends Process{
    memory: ProcessMineDepositInterface;

    targetName: string;
    closing: boolean;
    type: DepositConstant;

    constructor(roomName: string, targetName: string, type: DepositConstant){
        super(roomName, 'mineDeposit');
        this.targetName = targetName;
        this.type = type;
    }

    static getInstance(struct: ProcessMineDepositInterface, roomName: string): ProcessMineDeposit{
        return new ProcessMineDeposit(roomName, struct.tgt, struct.type);
    }

    check() {
        if(Game.cpu.bucket > 4500) return true;
        return false;
    }

    run(){
        if(Game.cpu.bucket < 4000) {
            this.suspend();
            return;
        }
        let room = intel[this.targetName];
        this.foreachCreep(()=>{});
        let creeps = _.groupBy(_.map(this.creeps, creepName => Game.creeps[creepName]), creep => creep.memory.role);

        if(room){
            if(!room.deposit || room.deposit.cooldown > 100){
                if(!creeps['dTransporter'] && !creeps['container']) {
                    this.close();
                    return;
                } else {
                    let hasNoDeposit = true;
                    this.foreachCreep(creep =>{ 
                        if(creep.memory.role == 'dHarvester') creep.suicide();
                        if(creep.store.getUsedCapacity()) hasNoDeposit = false; 
                    });
                    if(hasNoDeposit){
                        this.close();
                        return;
                    }
                    this.closing = true;
                    this.foreachCreep((creep) => this.runCreep(creep));
                    return;
                }
            }

            if(room.deposit){
                // let terminal = Game.rooms[this.roomName].terminal;
                // if(terminal && terminal.store.getUsedCapacity(this.type) >= 35000) this.close();
                this.foreachCreep((creep) => this.runCreep(creep));
                if(!creeps['dTransporter'] && !this.closing) CreepWish.wishCreep(this.roomName, 'dTransporter', this.fullId);
                if(!creeps['dHarvester'] && !this.closing) CreepWish.wishCreep(this.roomName, 'dHarvester', this.fullId);
                if(!creeps['container'] && !this.closing) CreepWish.wishCreep(this.roomName, 'container', this.fullId);
                return;
            }
        } else this.foreachCreep((creep) => this.runCreep(creep));
    }

    runCreep(creep: Creep){
        switch (creep.memory.role) {
            case 'dTransporter':
                let rd = RoleFactory.getRole(creep, creep => new RoleDTransporter(creep, this.targetName, this.type)) as RoleDTransporter;
                if(rd) {
                    rd.closing = this.closing;
                    rd.run();
                }
                break;
            case 'dHarvester':
                let rh = RoleFactory.getRole(creep, creep => new RoleDHarvester(creep, this.targetName)) as RoleDHarvester;
                if(rh) rh.run();
                break;
            case 'container':
                let rc = RoleFactory.getRole(creep, creep => new RoleContainer(creep, this.targetName, this.type)) as RoleContainer;
                if(rc) rc.run();
                break;
            default:
                break;
        }
    }

    getStruct(): ProcessMineDepositInterface {
        return _.merge(super.getStruct(), {tgt: this.targetName, type: this.type})
    }

    close(){
        this.foreachCreep(creep => creep.suicide());
        super.close();
    }
}