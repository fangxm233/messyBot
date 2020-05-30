import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { RoleFactory } from "../../roles/roleFactory";
import { CreepWish } from "../../programs/creepWish";
import { ProcessBoost } from "./boost";
import { Processes } from "../processes";
import { Traveler } from "../../programs/Traveler";

@profile
export class ProcessStronghold4 extends Process {
    memory: ProcessStronghold4Interface;
    boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'} = {};
    targetRoom: string;

    warrior: Creep;
    warrior2: Creep;
    healer: Creep;

    role2Compounds: {[role: string]: MineralBoostConstant[]} = {
        shWarrior: ['XGHO2', 'XKHO2', 'XZHO2'],
        shWarrior2: ['XUH2O', 'XZHO2'],//XUH2O
        shHealer: ['XLHO2', 'XZHO2']
    };

    constructor(roomName: string, targetRoom: string) {
        super(roomName, 'stronghold4');
        this.targetRoom = targetRoom;
    }

    registerCreep(creepName: string) {
        super.registerCreep(creepName);
        this.boostFlag[creepName] = 'none';
        this.memory.boostFlag[creepName] = 'none';
    }
    removeCreep(creepName: string) {
        super.removeCreep(creepName);
        delete this.boostFlag[creepName];
        delete this.memory.boostFlag[creepName];
    }

    static getInstance(struct: ProcessStronghold4Interface, roomName: string): ProcessStronghold4 {
        let process = new ProcessStronghold4(roomName, struct.targetRoom);
        process.boostFlag = struct.boostFlag;
        return process;
    }

    run() {
        this.foreachCreep(()=>{});
        let flag = _.find(Game.flags, flag => flag.pos.roomName == this.targetRoom && flag.name.match('sh4'));
        if(!flag) {
            this.close();
            return;
        }
        let creeps = _.groupBy(_.map(this.creeps, creepName => Game.creeps[creepName]), creep => creep.memory.role);
        if(!creeps['shWarrior']) creeps['shWarrior'] = [];
        if(!creeps['shWarrior2']) creeps['shWarrior2'] = [];
        if(!creeps['shHealer']) creeps['shHealer'] = [];

        if(!creeps['shWarrior'].length) CreepWish.wishCreep(this.roomName, 'shWarrior', this.fullId, undefined, ['t2', 'r2', 'm1']);
        if(!creeps['shWarrior2'].length && Game.flags['t']) CreepWish.wishCreep(this.roomName, 'shWarrior2', this.fullId, undefined, ['a4', 'm1']);
        if(!creeps['shHealer'].length) CreepWish.wishCreep(this.roomName, 'shHealer', this.fullId, undefined, ['h4', 'm1']);

        this.warrior = creeps['shWarrior'][0];
        this.healer = creeps['shHealer'][0];

        _.compact([this.warrior, this.healer, ...creeps['shWarrior2']]).forEach(creep => {
            if(creep.spawning || this.boostFlag[creep.name] != 'none') return;
            if(Process.getProcess(this.roomName, 'boost')) return;
            let enough = ProcessBoost.enoughToBoost(this.roomName, this.role2Compounds[creep.memory.role], creep);
            if(enough) {
                Processes.processBoost(this.roomName, this.role2Compounds[creep.memory.role], creep.name, this.fullId);
                this.boostFlag[creep.name] = 'boosting';
                return false;
            }
            return;
        });

        if(this.warrior && this.boostFlag[this.warrior.name] == 'boosted' && this.healer && this.boostFlag[this.healer.name] == 'boosted') {
            this.runWarrior(flag);
        }

        if(creeps['shWarrior2'].length) {
            creeps['shWarrior2'].forEach(w => {
                if(this.boostFlag[w.name] == 'boosted') this.runWarrior2(w);
            })
        }
    }

    boostedCreep(creepName: string) {
        this.boostFlag[creepName] = 'boosted';
        this.memory.boostFlag[creepName] = 'boosted';
    }

    getStruct(): ProcessAttackInterface{
        return _.merge(super.getStruct(), {boostFlag: this.boostFlag, targetRoom: this.targetRoom});
    }

    runWarrior(flag: Flag) {
        if(this.warrior.pos.isEdge) {
            Traveler.avoidEdge(this.warrior);
            this.runHealer(true);
            return;
        }

        if(!this.warrior.pos.isEqualTo(flag) && this.warrior.pos.isNearTo(this.healer)) {
            this.warrior.travelTo(flag, {allowSK: true});
            this.runHealer(true);
            return;
        }

        if(!this.warrior.pos.isEqualTo(flag)) {
            this.runHealer(true);
            return;
        }

        let core = this.warrior.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {filter: s => s.structureType == STRUCTURE_INVADER_CORE})[0];
        if(!core) return;
        this.warrior.rangedAttack(core);

        this.runHealer(false);
    }

    runHealer(moved: boolean) {
        if(!this.healer.pos.isNearTo(this.warrior) || moved) {
            this.healer.travelTo(this.warrior);
        }

        if(this.healer.pos.isNearTo(this.warrior)) this.healer.heal(this.warrior);
    }

    runWarrior2(warrior: Creep) {
        // if(warrior.body[0].type == ATTACK && 1) return;
        let flag = Game.flags.t;
        // if(warrior.body[0].type == ATTACK) flag = Game.flags.tt
        if(!flag) return;

        if(!warrior.pos.isNearTo(flag)) {
            warrior.travelTo(flag);
            return;
        }

        let creep = warrior.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {filter: c => !c.inRampart})[0];
        if(creep && warrior.body[0].type == ATTACK) {
            warrior.attack(creep);
            return;
        }

        let structures = flag.pos.lookFor(LOOK_STRUCTURES);
        let s = structures[0];
        structures.forEach(str => {
            if(str.structureType == STRUCTURE_RAMPART) s = str;
        })
        if(s) {
            if(warrior.body[0].type == WORK) warrior.dismantle(s);
            if(warrior.body[0].type == ATTACK) warrior.attack(s);
        }
    }

    close() {
        this.foreachCreep(creep => creep.suicide());
        super.close();
    }
}