export function toRoomPosition(coord: Coord, roomName: string): RoomPosition{
    return new RoomPosition(coord.x, coord.y, roomName);
}

export function refreshRoomPosition(pos: {x: number, y: number, roomName: string}): RoomPosition{
    // if(!pos.x || !pos.y || !pos.roomName) return {} as RoomPosition;
    return new RoomPosition(pos.x, pos.y, pos.roomName);
}

export function refreshGameObject<T>(obj: T): T{
    let aobj = obj as any;
    if(aobj.id) return Game.getObjectById(aobj.id) as T;
    return {} as T;
}

export function addObject<T>(obj1: T, obj2: T): T{
    let result: T = {} as any;

    for (const key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            const element = obj1[key];
            result[key] = element;
        }
    }

    for (const key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            const element = obj2[key];
            if(typeof element == 'number' && result[key]){
                result[key] += element as any;
                continue;
            }
            result[key] = element;
        }
    }
    return result;
}

export function mulObject<T>(obj: T, num: number): T{
    let result = {} as any;

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            if(typeof element == 'number'){
                result[key] = element * num;
            }
        }
    }
    return result;
}

export function isEqual(c1: Coord, c2: Coord): boolean{
    return c1.x == c2.x && c1.y == c2.y;
}

export function getRangeTo(c1: Coord, c2: Coord): number{
    let dx = c1.x - c2.x;
    let dy = c1.y - c2.y;
    return Math.max(Math.abs(dx), Math.abs(dy));
}

export function getRangeToEdge(coord: Coord): number{
    return _.min([coord.x, 49 - coord.x, coord.y, 49 - coord.y]);
}

export function isEdge(coord: Coord): boolean{
    return coord.x == 0 || coord.x == 49 || coord.y == 0 || coord.y == 49;
}

export function isOutOfRoom(coord: Coord): boolean{
    return coord.x < 0 || coord.x > 49 || coord.y < 0 || coord.y > 49;
}

export function hasAggressiveBodyParts(creep: Creep, includeHeal: boolean = true): boolean {
    return !!(creep.bodyCounts[ATTACK] || creep.bodyCounts[RANGED_ATTACK] || creep.bodyCounts[WORK] || (includeHeal && creep.bodyCounts[HEAL]));
}

export const boostParts: { [boostType: string]: BodyPartConstant } = {

	UH: ATTACK,
	UO: WORK,
	KH: CARRY,
	KO: RANGED_ATTACK,
	LH: WORK,
	LO: HEAL,
	ZH: WORK,
	ZO: MOVE,
	GH: WORK,
	GO: TOUGH,

	UH2O: ATTACK,
	UHO2: WORK,
	KH2O: CARRY,
	KHO2: RANGED_ATTACK,
	LH2O: WORK,
	LHO2: HEAL,
	ZH2O: WORK,
	ZHO2: MOVE,
	GH2O: WORK,
	GHO2: TOUGH,

	XUH2O: ATTACK,
	XUHO2: WORK,
	XKH2O: CARRY,
	XKHO2: RANGED_ATTACK,
	XLH2O: WORK,
	XLHO2: HEAL,
	XZH2O: WORK,
	XZHO2: MOVE,
	XGH2O: WORK,
	XGHO2: TOUGH,
};

export function getTargetBodyPart(compount: MineralBoostConstant): BodyPartConstant{
    return boostParts[compount];
}

export function calTowerDamage(dist: number) {
    if (dist <= 5) return 600;
    else if (dist <= 20) return 600 - (dist - 5) * 30;
    else return 150;
}

export function possibleTowerDamage(room: Room, pos: RoomPosition): number{
    return _.sum(room.towers, tower => {
        let ratio = 1;
        if(tower.effects && tower.effects.length) tower.effects.forEach(effect => {
            if(effect.effect == PWR_OPERATE_TOWER) ratio = POWER_INFO[effect.effect].effect[effect.level];
        });
        return calTowerDamage(tower.pos.getRangeTo(pos)) * ratio;
    });
}

export function possibleCreepRangeDamage(body: BodyPartDefinition[], range: number, risk?: boolean): number{
    let rangePower: number = RANGED_ATTACK_POWER;
    if(range > 3) rangePower = risk ? (RANGED_ATTACK_POWER / range) : 0;
    return _.sum(body, part => part.type == RANGED_ATTACK && part.hits ? rangePower * (part.boost ? BOOSTS.ranged_attack[part.boost].rangedAttack : 1) : 0);
}

export function possibleCreepNearDamage(body: BodyPartDefinition[], range: number, risk?: boolean): number{
    let attackPower: number = ATTACK_POWER;
    if(range > 1) attackPower = risk ? (ATTACK_POWER / range / 2) : 0;
    return _.sum(body, part => part.type == ATTACK && part.hits ? attackPower * (part.boost ? BOOSTS.attack[part.boost].attack : 1) : 0);
}

export function possibleCreepDamage(body: BodyPartDefinition[], range: number, risk?: boolean): number{
    return possibleCreepNearDamage(body, range, risk) + possibleCreepRangeDamage(body, range, risk);
}

export function getHeal(body: BodyPartDefinition[], range: number) {
    let healPower: number = RANGED_HEAL_POWER;
    if(range > 3) healPower = 0;
    if(range <= 1) healPower = HEAL_POWER;
    return _.sum(body, part => part.type == HEAL && part.hits ? healPower * (part.boost ? BOOSTS.heal[part.boost].heal : 1) : 0);
}

export function possibleHealHits(pos: RoomPosition, creeps: Creep[]): number{
    return _.sum(creeps, c => getHeal(c.body, pos.getRangeTo(c)));
}

export function hitsOnTough(body: BodyPartDefinition[], damage: number): number{
    let hits = 0;
    let damageRemain = damage;
    for (const part of body) {
        if(!part.hits) continue;
        if(damageRemain <= 0) return hits;
        if(part.type == 'tough' && part.boost) {
            if(damageRemain * BOOSTS.tough[part.boost].damage > 100) {
                hits += 100;
                damageRemain -= 100 / BOOSTS.tough[part.boost].damage;
            } else {
                hits += damageRemain * BOOSTS.tough[part.boost].damage;
                damageRemain = 0;
            }
            continue;
        }
        if(damageRemain > 100) {
            hits += 100;
            damageRemain -= 100;
        } else {
            hits += damageRemain;
            return hits;
        }
    }
    return hits + damageRemain;
}

export function possibleDamage(body: BodyPartDefinition[], pos: RoomPosition, username: string, heal?: boolean, towerDamage?: number, risk?: boolean): number{
    let attackers = pos.findInRange(FIND_CREEPS, risk ? 50 : 3, 
        { filter: creep => creep.owner.username != username && (creep.bodyCounts[ATTACK] || creep.bodyCounts[RANGED_ATTACK])});

    let possibleDamage = _.sum(attackers, attacker => possibleCreepDamage(attacker.body, pos.getRangeTo(attacker), risk)) + (towerDamage || 0);
    possibleDamage = hitsOnTough(body, possibleDamage);
    let possibleHeal = 0;
    if(heal) {
        let healers = pos.findInRange(FIND_CREEPS, 3, { filter: creep => creep.owner.username == username && creep.bodyCounts[HEAL]});
        possibleHeal = possibleHealHits(pos, healers);
    }
    // console.log('damage', possibleDamage, 'towerDamage', towerDamage, 'heal', possibleHeal)
    return possibleDamage - possibleHeal;
}

export function wouldBreakDefend(body: BodyPartDefinition[], pos: RoomPosition, username: string, towerDamage?: number, risk?: boolean): boolean {
    return possibleDamage(body, pos, username, true, towerDamage, risk) > 0;
}

