export const lowEnergyLine = 100000;
export const towerRepairLine = 790000;
export const USE_PROFILE = false;
export const USE_ACTION_COUNTER = true;

export const USER_NAME = getUsername();

export function getUsername(): string {
	for (const i in Game.rooms) {
		const room = Game.rooms[i];
		if (room.controller && room.controller.my && room.controller.owner) {
			return room.controller.owner.username;
		}
	}
	for (const i in Game.creeps) {
		const creep = Game.creeps[i];
		if (creep.owner) {
			return creep.owner.username;
		}
	}
	console.log('ERROR: Could not determine username. You can set this manually in src/config');
	return 'ERROR: Could not determine username.';
}