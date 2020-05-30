import { RoleTransporter } from "./transporter";
import { RoleHarvester } from "./harvester";
import { RoleHauler } from "./hauler";
import { RoleDismantler } from "./dismantler";
import { RoleUpgrader } from "./upgrader";
import { RoleReservist } from "./reservist";
import { RoleWorker } from "./worker";
import { RolePioneer } from "./pioneer";
import { RoleMiner } from "./miner";
import { RoleManager } from "./manager";
import { RoleFiller } from "./filler";
import { Role } from "./role";

const creepRoles: { [name: string]: Role | undefined } = {};

export class RoleFactory {

    static getRole(creep: Creep, constructor?: (creep: Creep) => Role): Role | undefined {
        let role = this.getRoleCore(creep, constructor);
        if (role) role.creep = creep;
        return role;
    }

    private static getRoleCore(creep: Creep, constructor?: (creep: Creep) => Role): Role | undefined {
        if (creepRoles[creep.name]) {
            return creepRoles[creep.name];
        }
        if (constructor) return creepRoles[creep.name] = constructor(creep);
        return creepRoles[creep.name] = this.getInstance(creep);
    }

    static removeRole(creepName: string) {
        creepRoles[creepName] = undefined;
    }

    private static getInstance(creep: Creep) {
        return this.getSpecificRoleInstance(creep, creep.memory.role);
    }

    private static getSpecificRoleInstance(creep: Creep, role: string) {
        switch (role) {
            case 'transporter':
                return new RoleTransporter(creep);
            case 'manager':
                return new RoleManager(creep);
            case 'harvester':
                return new RoleHarvester(creep);
            case 'worker':
                return new RoleWorker(creep);
            case 'hauler':
                return new RoleHauler(creep);
            case 'dismantler':
                return new RoleDismantler(creep);
            case 'upgrader':
                return new RoleUpgrader(creep);
            case 'reservist':
                return new RoleReservist(creep);
            case 'miner':
                return new RoleMiner(creep);
            case 'pioneer':
                return new RolePioneer(creep);
            case 'filler':
                return new RoleFiller(creep);
            default:
                return;
            // console.log('unhandled role', role);
            // throw new Error('unhandled role ' + role)
        }
    }
}
