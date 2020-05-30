import { Process } from "../process";
import { profile } from "../../profiler/decorator";
import { RoleFactory } from "../../roles/roleFactory";
import { RoleRepairer } from "../../roles/repair/repairer";
import { RoleRCarrier } from "../../roles/repair/rCarrier";
import { CreepWish } from "../../programs/creepWish";
import { ProcessBoost } from "./boost";
import { Processes } from "../../process/processes";

@profile
export class ProcessRepair extends Process{
    memory: ProcessRepairInterface;
    type: 'normal' | 'defend';
    timeOut: number;
    groupNum: number;
    suspendBucket: number;
    activeBucket: number;
    suspendEnergy: number;
    activeEnergy: number;
    targetHit: number;

    boostFlag: {[creepName: string]: 'boosting' | 'boosted' | 'none'} = {};
    closing = false;
    suspending = false;

    constructor(roomName: string, type: 'normal' | 'defend', boostFlag?: {[creepName: string]: 'boosting' | 'boosted' | 'none'}) {
        super(roomName, 'repair');
        this.type = type;
        if(boostFlag) this.boostFlag = boostFlag;
        else boostFlag = {};
        this.setType(type);
    }

    registerCreep(creepName: string) {
        super.registerCreep(creepName);
        this.boostFlag[creepName] = 'none';
    }
    removeCreep(creepName: string) {
        super.removeCreep(creepName);
        delete this.boostFlag[creepName];
    }

    static getInstance(struct: ProcessRepairInterface, roomName: string): ProcessRepair {
        let process = new ProcessRepair(roomName, struct.type, struct.boostFlag);
        process.suspending = struct.suspending;
        process.closing = struct.closing;
        return process;
    }

    setType(type: 'normal' | 'defend') {
        this.type = type;
        if(this.memory) this.memory.type = type;
        if(type == 'normal') {
            this.timeOut = 500;
            this.groupNum = 2;
            this.suspendBucket = 2000;
            this.activeBucket = 5000;
            this.suspendEnergy = 500000; //!!!!
            this.activeEnergy = 550000;
            this.targetHit = 1e6;
        } else {
            this.timeOut = 50;
            this.groupNum = 3;
            this.suspendBucket = 1000;
            this.activeBucket = 2000;
            this.suspendEnergy = 100000;
            this.activeEnergy = 120000;
            this.targetHit = 2e7;
        }
    }
    setSuspending(suspending: boolean) {
        this.memory.suspending = suspending;
        this.suspending = suspending;
    }
    setClosing(closing: boolean) {
        this.memory.closing = closing;
        this.closing = closing;
    }

    check(): boolean {
        let room = Game.rooms[this.roomName];
        if(room) {
            let storage = room.storage;
            if(storage && storage.store.energy > this.activeEnergy && Game.cpu.bucket > this.activeBucket) return true;
        }
        return false;
    }

    run() {
        this.foreachCreep(()=>{});
        let creeps = _.groupBy(_.map(this.creeps, creepName => Game.creeps[creepName]), creep => creep.memory.role);
        if(!creeps['repairer']) creeps['repairer'] = [];
        if(!creeps['rCarrier']) creeps['rCarrier'] = [];
        let repairers = _.map(creeps['repairer'], creep => RoleFactory.getRole(creep, creep => new RoleRepairer(creep)) as RoleRepairer);
        let rCarriers = _.map(creeps['rCarrier'], creep => RoleFactory.getRole(creep, creep => new RoleRCarrier(creep)) as RoleRCarrier);

        if(!this.closing && !this.suspending) {
            if(repairers.length < this.groupNum) CreepWish.wishCreep(this.roomName, 'repairer', this.fullId);
            if(rCarriers.length < this.groupNum) CreepWish.wishCreep(this.roomName, 'rCarrier', this.fullId);
        }

        if(this.closing && repairers.length == 0) {
            this.close();
            this.closing = false;
        }
        if(this.suspending && repairers.length == 0) {
            this.suspend();
            this.suspending = false;
        }

        repairers.forEach(role => {
            if(!role.rCarrierName && !role.creep.spawning) {
                let freeCarrier = rCarriers.filter(role => !role.repairerName && !role.creep.spawning)[0];
                if(freeCarrier) {
                    role.rCarrierName = freeCarrier.creep.name;
                    freeCarrier.repairerName = role.creep.name;
                }
            }
        });

        repairers.forEach((role) => {
            if(!role.creep.spawning && this.boostFlag[role.creep.name] == 'none' && !Process.getProcess(this.roomName, 'boost') 
                && ProcessBoost.enoughToBoost(this.roomName, ['XLH2O'], role.creep)) {
                Processes.processBoost(this.roomName, ['XLH2O'], role.creep.name, this.fullId);
                this.boostFlag[role.creep.name] = 'boosting';
                return;
            }
            this.runCreep(role);
        });
        rCarriers.forEach((creep) => this.runCreep(creep));

        if(this.type == 'defend' && !Process.getProcess(this.roomName, 'activeDefend') && !Process.getProcess(this.roomName, 'defendNuke')) this.setType('normal');

        if(this.closing || this.suspending) return;

        if(Game.cpu.bucket < this.suspendBucket) this.suspend();

        let room = Game.rooms[this.roomName];
        if(room) {
            if(Game.time % 20 == 0) {
                if(!room.ramparts.find(rampart => rampart.hits < rampart.targetHits)) this.setClosing(true);
            }
    
            let storage = room.storage;
            if(storage && storage.energy < this.suspendEnergy) this.setSuspending(true);
        }
    }

    runCreep(role: RoleRCarrier | RoleRepairer) {
        if(this.boostFlag[role.creep.name] == 'boosting') return;
        role.process = this;
        role.run();
    }

    boostedCreep(creepName: string) {
        this.boostFlag[creepName] = 'boosted';
        this.memory.boostFlag[creepName] = 'boosted';
    }

    getStruct(): ProcessRepairInterface{
        return _.merge(super.getStruct(), {type: this.type, boostFlag: this.boostFlag, suspending: this.suspending, closing: this.closing});
    }

    suspend() {
        this.setSuspending(false);
        super.suspend();
    }

    close(){
        this.foreachCreep(creep => creep.suicide());
        super.close();
    }
}