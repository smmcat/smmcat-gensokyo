import { BattleAttribute, getLineupName } from "../battle"
import { BuffDamage, DamageConfig, giveCure } from "../damage"
import { random } from "../utlis"
import { buffTimeFormat, clearBuff, giveBuff } from "./buffFn"


export type PassiveDict = {
    [keys: string]: PassiveItem
}

export type PassiveItem = {
    name: string,
    info: string,
    type: 'atk' | 'hit',
    lv: number,
    damageFn: (config: DamageConfig) => string
}

export const PassiveFn: PassiveDict = {
    "吸血": {
        name: "吸血",
        info: "造成伤害时，汲取10%该次伤害的值治疗自己",
        type: 'atk',
        lv: 1,
        damageFn: function (config) {
            const val = Math.floor(config.harm * 0.1)
            if (val) {
                const res = giveCure(config.linkAgent.self, val)
                return `‣ ${getLineupName(config.linkAgent.self)}触发被动 ¦${this.name}¦ HP+${res.val}`
            }
            return ``
        }
    },
    "反伤": {
        name: "反伤",
        info: "有40%概率直接反弹本次伤害的20%（真实伤害）",
        type: 'hit',
        lv: 1,
        damageFn: function (config) {
            const val = Math.floor(config.harm * 0.2)
            if (val && random(0, 10) <= 4) {
                const value = new BuffDamage(val, config.linkAgent.self, true).giveDamage()
                return `‣ ${getLineupName(config.linkAgent.goal)}触发被动 ¦${this.name}¦ HP-${value}`
            }
            return ``
        }
    },
    "破势": {
        name: "破势",
        info: "敌方血量大于70%时，造成的伤害提高30%",
        type: 'atk',
        lv: 1,
        damageFn: function (config) {
            if (config.linkAgent.goal.hp / config.linkAgent.goal.maxHp > 0.7) {
                const upVal = Math.floor(config.harm * 0.3)
                if (upVal) {
                    config.harm += Math.floor(config.harm * 0.3)
                    return `‣ ${getLineupName(config.linkAgent.self)}触发被动 ¦${this.name}¦ 伤害+${upVal}`
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
        lv: 1,
        damageFn: function (config) {
            if (config.linkAgent.goal.hp / config.linkAgent.goal.maxHp < 0.4) {
                const upVal = Math.floor(config.harm * 0.3)
                if (upVal) {
                    config.harm += Math.floor(config.harm * 0.3)
                    return `‣ ${getLineupName(config.linkAgent.self)}触发被动 ¦${this.name}¦ 伤害+${upVal}`
                }
                return ``
            }
            return ``
        }
    },
    "针女": {
        name: "针女",
        info: "造成暴击有50%概率额外造成敌方5%血量真实伤害（伤害最大不超过使用者攻击力的120%）",
        type: 'atk',
        lv: 1,
        damageFn: function (config) {
            if (config.isCsp && random(0, 10) <= 5) {
                const upVal = Math.min(
                    Math.floor((config.linkAgent.self.atk + config.linkAgent.self.gain.atk) * 1.2),
                    Math.floor(config.linkAgent.goal.maxHp * 0.05)
                )
                if (upVal) {
                    const value = new BuffDamage(upVal, config.linkAgent.goal, true).giveDamage()
                    return `‣ ${getLineupName(config.linkAgent.self)}触发被动 ¦${this.name}¦ HP-${value}`
                }
                return ``
            }
            return ``
        }
    },
    "霜灼破": {
        name: "霜灼破",
        info: "造成伤害时有 20% 概率为自身增加1点 ⌈落霜⌋ 印记，每层 ⌈落霜⌋ 印记增加 5% 攻击力，持续6回合",
        type: 'atk',
        lv: 5,
        damageFn: function (config) {
            if (random(0, 10) <= 2) {
                giveBuff(config.linkAgent.self, { name: "落霜", timer: 6 })
                return `‣ ${getLineupName(config.linkAgent.self)}触发被动 ¦${this.name}¦ 获得1点落霜`
            }
            return ``
        }
    },

}