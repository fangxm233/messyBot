import { ProcessFilling } from "./instances/filling";
import { Process } from "./process";
import { Visualizer } from "../programs/Visualizer";
import { ProcessMining } from "./instances/mining";
import { ProcessMinePower } from "./instances/minePower";
import { powerRegion, intel, depositRegion } from "../programs/Intel";
import { profile } from "../profiler/decorator";
import { ProcessDefend } from "./instances/defend";
import { ProcessMineDeposit } from "./instances/mineDeposit";
import { ProcessRepair } from "./instances/repair";
import { ProcessBoost } from "./instances/boost";
import { ProcessActiveDefend } from "./instances/activeDefend";
import { ProcessDefendNuke } from "./instances/defendNuke";
import { ProcessAttack } from "./instances/attack";
import { ProcessAttackController } from "./instances/attackController";
import { ProcessHelping } from "./instances/helping";

@profile
export class Processes {
    static processFilling(roomName: string): ProcessFilling {
        let process = new ProcessFilling(roomName);
        Process.startProcess(process);
        return process;
    }

    static processMining(roomName: string): ProcessMining {
        let process = new ProcessMining(roomName);
        Process.startProcess(process);
        return process;
    }

    static processMinePower(roomName: string, targetName: string): ProcessMinePower {
        let process = new ProcessMinePower(roomName, targetName);
        Process.startProcess(process);
        return process;
    }

    static processMineDeposit(roomName: string, targetName: string, type: DepositConstant): ProcessMineDeposit {
        let process = new ProcessMineDeposit(roomName, targetName, type);
        Process.startProcess(process);
        return process;
    }

    static processDefend(roomName: string, targetName: string, type: 'creep' | 'coreDis'): ProcessDefend {
        let process = new ProcessDefend(roomName, targetName, type);
        Process.startProcess(process);
        return process;
    }

    static processRepair(roomName: string, type: 'normal' | 'defend'): ProcessRepair {
        let process = new ProcessRepair(roomName, type);
        Process.startProcess(process);
        return process;
    }

    static processBoost(roomName: string, compoundTypes: MineralBoostConstant[], creepName: string, processId: string): ProcessBoost {
        let process = new ProcessBoost(roomName, compoundTypes, creepName, processId);
        Process.startProcess(process);
        return process;
    }

    static processActiveDefend(roomName: string): ProcessActiveDefend {
        let process = new ProcessActiveDefend(roomName);
        Process.startProcess(process);
        return process;
    }

    static processDefendNuke(roomName: string): ProcessDefendNuke {
        let process = new ProcessDefendNuke(roomName);
        Process.startProcess(process);
        return process;
    }

    static processAttack(roomName: string, targetRoom: string): ProcessAttack {
        let process = new ProcessAttack(roomName, targetRoom);
        Process.startProcess(process);
        return process;
    }

    static processAttackController(roomName: string, targetRoom: string, creepNum: number): ProcessAttackController {
        let process = new ProcessAttackController(roomName, targetRoom, creepNum);
        Process.startProcess(process);
        return process;
    }

    static processHelping(roomName: string, targetRoom: string, sourceRoom: string, creepNum: number): ProcessHelping {
        let process = new ProcessHelping(roomName, targetRoom, sourceRoom, creepNum);
        Process.startProcess(process);
        return process;
    }

    public static minePower() {
        for (const roomName in powerRegion) {
            if (!Game.rooms[roomName]) continue;
            let storage = Game.rooms[roomName].storage;
            if (storage && storage.energy < 600000) continue;
            let rooms = powerRegion[roomName];
            for (const powerRoomName of rooms) {
                if (!intel[powerRoomName]) continue;
                let i = intel[powerRoomName];
                if (i.powerBank && i.powerBank.ticks > 4000 && i.powerBank.amount > 3000) {
                    if (Process.getProcess(roomName, 'minePower', 'targetName', powerRoomName)) continue;
                    Processes.processMinePower(roomName, powerRoomName);
                }
            }
        }
    }

    public static mineDeposit() {
        for (const roomName in depositRegion) {
            if (!Game.rooms[roomName]) continue;
            let terminal = Game.rooms[roomName].terminal;
            if (!terminal) continue;
            let rooms = depositRegion[roomName];
            for (const depositRoomName of rooms) {
                if (!intel[depositRoomName]) continue;
                let i = intel[depositRoomName];
                if (i.deposit && i.deposit.cooldown < 100) {
                    if (terminal.store.getUsedCapacity(i.deposit.type) >= 70000) break;
                    if (Process.getProcess(roomName, 'mineDeposit', 'targetName', depositRoomName)) continue;
                    Processes.processMineDeposit(roomName, depositRoomName, i.deposit.type);
                }
            }
        }
    }

    static rebuildProcess(processI: ProcessInterface, roomName: string, id: number) {
        let process: Process | undefined = undefined;

        switch (processI.name) {
            case 'filling':
                process = ProcessFilling.getInstance(processI, roomName);
                break;
            case 'minePower':
                process = ProcessMinePower.getInstance(processI as ProcessMinePowerInterface, roomName);
                break;
            case 'defend':
                process = ProcessDefend.getInstance(processI as ProcessDefendInterface, roomName);
                break;
            case 'mineDeposit':
                process = ProcessMineDeposit.getInstance(processI as ProcessMineDepositInterface, roomName);
                break;
            case 'repair':
                process = ProcessRepair.getInstance(processI as ProcessRepairInterface, roomName);
                break;
            case 'boost':
                process = ProcessBoost.getInstance(processI as ProcessBoostInterface, roomName);
                break;
            case 'activeDefend':
                process = ProcessActiveDefend.getInstance(processI as ProcessActiveDefendInterface, roomName);
                break;
            case 'defendNuke':
                process = ProcessDefendNuke.getInstance(processI, roomName);
                break;
            case 'attack':
                process = ProcessAttack.getInstance(processI as ProcessAttackInterface, roomName);
                break;
            case 'attackController':
                process = ProcessAttackController.getInstance(processI as ProcessAttackControllerInterface, roomName);
                break;
            default:
                break;
        }
        if (process) {
            process.id = id;
            Process.addProcess(process);
            process.memory = processI;
            process.sleepTime = processI.slt;
            process.state = processI.state;
            process.creeps = processI.creeps;
        }
    }

    static rebuildProcesses() {
        console.log('rebuilding processes...');
        Process.processes = {};
        Process.process_Type = {};
        Process.processes_ID = {};
        if (!Memory.processes) {
            Memory.processes = {};
            return;
        }
        for (const roomName in Memory.processes) {
            const processes = Memory.processes[roomName];
            Process.processes[roomName] = {};
            for (const id in processes) {
                const processInterface = processes[id];
                if (!processInterface) continue;
                if (!Process.process_Type[processInterface.name]) Process.process_Type[processInterface.name] = {};
                processInterface.creeps = _.uniq(processInterface.creeps);
                this.rebuildProcess(processInterface, roomName, id as any);
            }
        }
    }

    static showHud() {
        for (const roomName in Process.processes) {
            const processes = Process.processes[roomName];
            let visual: string[][] = [];
            _.forEach(processes, process => {
                if (!process) return;
                visual.push([process.processName, process.state == 'active' ? 'active' : (process.state == 'suspended' ? 'suspended' : process.sleepTime.toString())])
            })
            Visualizer.infoBox('Processes', visual, { x: 1, y: 8, roomName }, 7.75);
        }
    }
}
