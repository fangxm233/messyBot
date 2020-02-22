/**
 Module: DamageCal
 Author: fangxm
 Date:   2020.02.04
 Usage:
 let damageCal = require('DamageCal');

 要计算tower该不该打一个creep或者creep该不该逃跑：
 let towerDamage = possibleTowerDamage(room, creep.pos);
 let break = wouldBreakDefend(creep.body, creep.pos, 你的用户名, towerDamage)
 if (break) {
     ...
 }

 这个模块是计算伤害的工具模块
*/

let DamageCal = {
    /**
     * 计算点到tower的伤害
     * @param {number} dist 点到tower的距离
     */
    calTowerDamage(dist) {
        if (dist <= 5) return 600;
        else if (dist <= 20) return 600 - (dist - 5) * 30;
        else return 150;
    },

    /**
     * 计算在一个房间内一个点的tower伤害总值
     * @param {Room} room tower所在房间
     * @param {RoomPosition} pos 要计算伤害的点
     */
    possibleTowerDamage(room, pos) {
        return _.sum(room.towers, tower => {
            if (tower.store.energy < 10) return 0;
            let ratio = 1;
            if (tower.effects && tower.effects.length) tower.effects.forEach(effect => {
                if (effect.effect == PWR_OPERATE_TOWER) ratio = POWER_INFO[effect.effect].effect[effect.level];
            });
            return calTowerDamage(tower.pos.getRangeTo(pos)) * ratio;
        });
    },

    /**
     * 计算一个creep的范围伤害
     * @param {BodyPartDefinition[]} body 该creep的body
     * @param {number} dis 距离
     * @param {boolean} risk 计不计算威胁值（攻击范围之外的creep），默认为false
     */
    possibleCreepRangeDamage(body, dis, risk = false) {
        let rangePower = RANGED_ATTACK_POWER;
        if (dis > 3) rangePower = risk ? (RANGED_ATTACK_POWER / dis) : 0;
        return _.sum(body, part => part.type == RANGED_ATTACK && part.hits ? rangePower * (part.boost ? BOOSTS.ranged_attack[part.boost].rangedAttack : 1) : 0);
    },

    /**
     * 计算一个creep的近战伤害
     * @param {BodyPartDefinition[]} body 该creep的body
     * @param {number} dis 距离
     * @param {boolean} risk 计不计算威胁值（攻击范围之外的creep），默认为false
     */
    possibleCreepNearDamage(body, dis, risk = false) {
        let attackPower = ATTACK_POWER;
        if (dis > 1) attackPower = risk ? (ATTACK_POWER / dis / 2) : 0;
        return _.sum(body, part => part.type == ATTACK && part.hits ? attackPower * (part.boost ? BOOSTS.attack[part.boost].attack : 1) : 0);
    },

    /**
     * 计算一个creep的总伤害
     * @param {BodyPartDefinition[]} body 该creep的body
     * @param {number} dis 距离
     * @param {boolean} risk 计不计算威胁值（攻击范围之外的creep），默认为false
     */
    possibleCreepDamage(body, dis, risk = false) {
        return possibleCreepNearDamage(body, dis, risk) + possibleCreepRangeDamage(body, dis, risk);
    },

    /**
     * 计算一个creep的治疗值
     * @param {BodyPartDefinition[]} body 该creep的body
     * @param {number} dis 距离
     */
    getHeal(body, dis) {
        let healPower = RANGED_HEAL_POWER;
        if (dis > 3) healPower = 0;
        if (dis <= 1) healPower = HEAL_POWER;
        return _.sum(body, part => part.type == HEAL && part.hits ? healPower * (part.boost ? BOOSTS.heal[part.boost].heal : 1) : 0);
    },

    /**
     * 计算一个位置可能接受的治疗值
     * @param {RoomPositon} pos 要计算治疗值的位置
     * @param {Creep[]} creeps 位置周围的治疗兵
     */
    possibleHealHits(pos, creeps) {
        return _.sum(creeps, c => getHeal(c.body, pos.getRangeTo(c)));
    },

    /**
     * 将伤害转换成对creep的真实伤害
     * @param {BodyPartBefinition[]} body 该creep的body
     * @param {number} damage 要转换的伤害
     */
    hitsOnTough(body, damage) {
        let hits = 0;
        let damageRemain = damage;
        for (const part of body) {
            if (!part.hits) continue;
            if (damageRemain <= 0) return hits;
            if (part.type == 'tough' && part.boost) {
                if (damageRemain * BOOSTS.tough[part.boost].damage > 100) {
                    hits += 100;
                    damageRemain -= 100 / BOOSTS.tough[part.boost].damage;
                } else {
                    hits += damageRemain * BOOSTS.tough[part.boost].damage;
                    damageRemain = 0;
                }
                continue;
            }
            if (damageRemain > 100) {
                hits += 100;
                damageRemain -= 100;
            } else {
                hits += damageRemain;
                return hits;
            }
        }
        return hits + damageRemain;
    },

    /**
     * 计算一个creep在某个位置可能受到的伤害
     * @param {BodyPartDefinition[]} body 该creep的body
     * @param {RoomPosition} pos 要计算伤害的位置
     * @param {string} username 用户名
     * @param {boolean} heal 是否计算治疗值，默认为true
     * @param {number} towerDamage tower在该位置的伤害，默认为0
     * @param {boolean} risk 计不计算威胁值（攻击范围之外的creep），默认为false
     */
    possibleDamage(body, pos, username, heal = true, towerDamage = 0, risk = false) {
        let attackers = pos.findInRange(FIND_CREEPS, risk ? 50 : 3,
            { filter: creep => creep.owner.username != username && (creep.bodyCounts[ATTACK] || creep.bodyCounts[RANGED_ATTACK]) });

        let possibleDamage = _.sum(attackers, attacker => possibleCreepDamage(attacker.body, pos.getRangeTo(attacker), risk)) + (towerDamage || 0);
        possibleDamage = hitsOnTough(body, possibleDamage);
        let possibleHeal = 0;
        if (heal) {
            let healers = pos.findInRange(FIND_CREEPS, 3, { filter: creep => creep.owner.username == username && creep.bodyCounts[HEAL] });
            possibleHeal = possibleHealHits(pos, healers);
        }
        return possibleDamage - possibleHeal;
    },

    /**
     * 计算一个creep在某个位置是否会被破防
     * @param {BodyPartDefinition[]} body 该creep的body
     * @param {RoomPosition} pos 要计算的位置
     * @param {string} username 用户名
     * @param {number} towerDamage tower在该位置的伤害，默认为0
     * @param {boolean} risk 计不计算威胁值（攻击范围之外的creep），默认为false
     */
    wouldBreakDefend(body, pos, username, towerDamage = 0, risk = false) {
        return possibleDamage(body, pos, username, true, towerDamage, risk) > 0;
    }
}

module.exports = DamageCal;
