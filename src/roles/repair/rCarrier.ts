import { Role } from "../role";
import { profile } from "../../profiler/decorator";
import { ProcessRepair } from "../../process/instances/repair";
import { ProcessActiveDefend, DANGEROUS_ZONE } from "../../process/instances/activeDefend";

@profile
export class RoleRCarrier extends Role{
    process: ProcessRepair;
    repairerName: string;
    sourceTarget: Id<StructureTerminal | StructureStorage>;

    constructor(creep: Creep) {
        super(creep);
    }

    run() {
        let repairer = Game.creeps[this.repairerName];
        if(!repairer) {
            this.repairerName = '';
            return;
        }

        if(this.creep.store.energy == 0) {
            this.getSource(repairer);
        }

        if(this.creep.store.energy > 0) {
            if(!this.creep.pos.inRangeTo(repairer, this.process.type == 'defend' ? 4 : 1)) {
                this.travelCarefully(repairer);
                return;
            }
            
            if(repairer.store.energy < repairer.store.getCapacity() * 0.25 || repairer.store.energy + this.creep.store.energy <= repairer.store.getCapacity()) {
                if(!this.creep.pos.inRangeTo(repairer, 1)) {
                    this.travelCarefully(repairer);
                    return;
                }
                else this.creep.transfer(repairer, RESOURCE_ENERGY);
                if(repairer.store.energy + this.creep.store.energy <= repairer.store.getCapacity()) this.getSource(repairer);
            }
        }
        this.avoidDanger();
    }

    getSource(repairer: Creep) {
        if(!this.sourceTarget) {
            let terminal = this.creep.room.terminal;
            let storage = this.creep.room.storage;
            let source: (StructureTerminal | StructureStorage)[] = [];
            if(storage && storage.store.energy) source.push(storage);
            if(terminal && terminal.store.energy) source.push(terminal);
            this.sourceTarget = _.min(source, s => s.pos.getRangeTo(this.creep)).id;
        }

        let source = Game.getObjectById(this.sourceTarget);
        if(!source) {
            this.sourceTarget = '' as any;
            return;
        }

        if(!this.creep.pos.inRangeTo(source, 1)) this.creep.travelTo(source);
        else {
            this.creep.withdraw(source, RESOURCE_ENERGY);
            this.creep.travelTo(repairer);
            this.sourceTarget = '' as any;
        }
    }

    travelCarefully(target: HasPos|RoomPosition) {
        let repath = 0;
        let matrix = ProcessActiveDefend.costMatrixs[this.creep.room.name];
        if(this.process.type == 'defend' && matrix) {
            if(_.contains(this.creep.pos.neighbors.map(pos => ProcessActiveDefend.costMatrixs[this.creep.room.name].get(pos.x, pos.y)), DANGEROUS_ZONE)) {
                repath = 0.5;
            }
        }
        this.creep.travelTo(target, { repath: repath, matrix: matrix });
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