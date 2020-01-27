import { profile } from "../profiler/decorator";
import { Role } from "./role";

@profile
export class RoleStableTransporter extends Role {
    run() {
        // if(1) return;
        // if(!this.creep.room.memory.stableTransporterPos) return;
        // if(!this.creep.room.memory.centerLink) return;
        // let pos = this.creep.room.memory.stableTransporterPos;
        // if (!this.creep.pos.isEqualTo(pos)) {
        //     this.creep.travelTo(pos);
        //     return;
        // }
        // let linkId = this.creep.room.memory.centerLink;
        // let link = Game.getObjectById<StructureLink>(linkId);
        // let upLink = Game.getObjectById<StructureLink>(this.creep.room.memory.upgradeLink);
        // if(upLink && link && upLink.energy < 600){
        //     let remain = upLink.energyCapacity - upLink.energy - link.energy;
        //     if(remain <= 0) { link.transferEnergy(upLink); return; }
        //     if(this.creep.room.storage){
        //         this.creep.withdraw(this.creep.room.storage, RESOURCE_ENERGY, Math.min(this.creep.store.getUsedCapacity(), remain));
        //     }
        //     this.creep.transfer(link, RESOURCE_ENERGY);
        //     return;
        // }
        // if(link && link.energy > 0){
        //     this.creep.withdraw(link, RESOURCE_ENERGY);
        //     if(this.creep.room.storage)
        //         this.creep.transfer(this.creep.room.storage, RESOURCE_ENERGY);
        //     return;
        // }
        // if(this.creep.carry.energy > 0 && this.creep.room.storage) this.creep.transfer(this.creep.room.storage, RESOURCE_ENERGY);
    }
}