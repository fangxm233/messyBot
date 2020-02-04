import { Role } from "../role";
import { profile } from "../../profiler/decorator";
import { SourceManager } from "../../programs/sourceManager";
import { ProcessRepair } from "../../process/instances/repair";
import { ProcessActiveDefend, DANGEROUS_ZONE } from "../../process/instances/activeDefend";

@profile
export class RoleRepairer extends Role{
    process: ProcessRepair;
    activeDefendProcess: ProcessActiveDefend;
    rCarrierName: string;
    target: Id<StructureRampart>;

    constructor(creep: Creep) {
        super(creep);
    }

    run() {
        let carrier = Game.creeps[this.rCarrierName];
        if(!carrier || carrier.room.name != this.creep.room.name) this.rCarrierName = '';
        if(Game.time % this.process.timeOut == 0) this.target = '' as any;
        let controller = this.creep.room.controller;
        if(!controller) return;

        if(this.creep.store.energy == 0 && !this.rCarrierName) {
            SourceManager.getSource(this.creep, false);
            return;
        }

        if(this.creep.store.energy) {
            if(!this.target) this.target = _.min(this.creep.room.ramparts.filter(
                r => r.hits < r.targetHits), r => r.hits).id; //&& (this.process.type != 'defend' || !r.pos.inRangeTo(controller as any, 1))
            if(!this.target) this.target = _.min(this.creep.room.ramparts, r => r.hits).id;
            let rampart = Game.getObjectById(this.target);
            if(!rampart) {
                this.target = '' as any;
                return;
            }

            if(!this.creep.pos.inRangeTo(rampart, 3)) {
                this.travelCarefully(rampart);
                return;
            }
            else this.creep.repair(rampart);
        }
        this.avoidDanger();
    }

    travelCarefully(target: HasPos|RoomPosition) {
        let repath = 0;
        if(this.process.type == 'defend' && ProcessActiveDefend.costMatrixs[this.creep.room.name]) {
            if(_.contains(this.creep.pos.neighbors.map(pos => ProcessActiveDefend.costMatrixs[this.creep.room.name].get(pos.x, pos.y)), DANGEROUS_ZONE)) {
                repath = 0.5;
            }
        }
        this.creep.travelTo(target, { range: 3, repath: repath, matrix: ProcessActiveDefend.costMatrixs[this.creep.room.name] });
    }

    avoidDanger() {
        let matrix = ProcessActiveDefend.costMatrixs[this.creep.room.name];
        if(this.process.type == 'defend' && matrix) {
            if(matrix.get(this.creep.pos.x, this.creep.pos.y) == DANGEROUS_ZONE) {
                let available = this.creep.pos.neighbors.filter(pos => matrix.get(pos.x, pos.y) != DANGEROUS_ZONE);
                if(available.length) {
                    this.creep.travelTo(available[0]);
                }
            }
        }
    }
}