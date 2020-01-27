import { Role } from "./role";
import { profile } from "../profiler/decorator";

@profile
export class RoleMiner extends Role{
    run(){
        let mineral = Game.getObjectById<Mineral>(this.creep.room.memory.mineral.mineralId);
        let extractor = Game.getObjectById<StructureExtractor>(this.creep.room.memory.mineral.extractorId);
        let container = Game.getObjectById<StructureContainer>(this.creep.room.memory.mineral.containerId);
        if(!mineral || ! extractor || !container) return;

        if (this.creep.pos.getRangeTo(container) != 0 && !this.creep.memory.containerId) {
            this.creep.travelTo(container);
            return;
        }

        if(extractor.cooldown == 0)
            this.creep.harvest(mineral);
    }
}

// @profile
// export class RoleMiner{
//     creep: Creep;

//     constructor(creep: Creep){
//         this.creep = creep;
//     }

//     run(mineral: Mineral, extractor: StructureExtractor, container: StructureContainer){
//         if (this.creep.pos.getRangeTo(container) != 0 && !this.creep.memory.containerId) {
//             this.creep.travelTo(container);
//             return;
//         }

//         if(extractor.cooldown == 0)
//             this.creep.harvest(mineral);
//     }
// }