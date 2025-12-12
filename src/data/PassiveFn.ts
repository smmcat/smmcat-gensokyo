import { BattleAttribute, getLineupName } from "../battle"
import { BuffDamage, DamageConfig, giveCure } from "../damage"
import { random } from "../utlis"


export type PassiveDict = {
    [keys: string]: PassiveItem
}

export type PassiveItem = {
    name: string,
    info: string,
    type: 'atk' | 'hit',
    damageFn: (config: DamageConfig) => string
}

export const PassiveFn: PassiveDict = {
    "吸血": {
        name: "吸血",
        info: "造成伤害时，汲取10%该次伤害的值治疗自己",
        type: 'atk',
        damageFn: function (config) {
            const val = Math.floor(config.harm * 0.1)
            if (val) {
                const res = giveCure(config.linkAgent.self, val)
                return `‣ ${getLineupName(config.linkAgent.self)}:[${this.name}] HP+${res.val}`
            }
            return ``
        }
    },
    "反伤": {
        name: "反伤",
        info: "有40%概率直接反弹本次伤害的20%（真实伤害）",
        type: 'hit',
        damageFn: function (config) {
            const val = Math.floor(config.harm * 0.2)
            if (val && random(0, 10) <= 4) {
                const value = new BuffDamage(val, config.linkAgent.self, true).giveDamage()
                console.log(config.linkAgent.self);
                return `‣ ${getLineupName(config.linkAgent.self)}:[${this.name}] HP-${value}`
            }
            return ``
        }
    },
    "破势": {
        name: "破势",
        info: "敌方血量大于70%时，造成的伤害提高30%",
        type: 'atk',
        damageFn: function (config) {
            if (config.linkAgent.goal.hp / config.linkAgent.goal.maxHp > 0.7) {
                const upVal = Math.floor(config.harm * 0.3)
                if (upVal) {
                    config.harm += Math.floor(config.harm * 0.3)
                    return `‣ ${getLineupName(config.linkAgent.self)}:[${this.name}] 伤害+${upVal}`
                }
                return ``
            }
            return ``
        }
    },
    "心眼": {
        name: "心眼",
        info: "敌方血量小于40%时，造成的伤害提高30%",
        type: 'atk',
        damageFn: function (config) {
            if (config.linkAgent.goal.hp / config.linkAgent.goal.maxHp < 0.4) {
                const upVal = Math.floor(config.harm * 0.3)
                if (upVal) {
                    config.harm += Math.floor(config.harm * 0.3)
                    return `‣ ${getLineupName(config.linkAgent.self)}:[${this.name}] 伤害+${upVal}`
                }
                return ``
            }
            return ``
        }
    },
    "针女": {
        name: "针女",
        info: "攻击时有40%概率额外造成敌方5%血量真实伤害（伤害最大不超过使用者攻击力的120%）",
        type: 'atk',
        damageFn: function (config) {
            if (random(0, 10) <= 4) {
                const upVal = Math.min(
                    config.linkAgent.self.atk + config.linkAgent.self.gain.atk,
                    Math.floor(config.linkAgent.goal.maxHp * 0.05)
                )
                if (upVal) {
                    const value = new BuffDamage(upVal, config.linkAgent.goal, true).giveDamage()
                    return `‣ ${getLineupName(config.linkAgent.goal)}:[${this.name}] HP-${value}`
                }
                return ``
            }
            return ``
        }
    }
}