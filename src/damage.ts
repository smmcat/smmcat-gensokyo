import { BattleAttribute } from "./battle";
import { BuffFn } from "./data/buffFn";
import { PassiveFn } from "./data/PassiveFn";
import { random } from "./utlis";


type DamageCallback = {
    before?: Callback;
    beforRealHarm?: Callback;
    evasion?: Callback;
    csp?: Callback;
    beforDef?: Callback;
    beforEnd?: Callback
}
/** 当前伤害回调函数 */
interface Callback {
    (data: DamageConfig): void;
}

export type DamageConfig = {
    agent: { self: BattleAttribute, goal: BattleAttribute }
    /** 浅拷贝数据 */
    linkAgent: { self: BattleAttribute, goal: BattleAttribute }
    /** 实际伤害数据 */
    harm: number
    /** 原始伤害数据 */
    default_harm: number
    /** 是否为真实伤害 */
    isRealHarm: boolean
    /** 是否闪避 */
    isEvasion: boolean
    /** 是否暴击 */
    isCsp: boolean
    /** 是否未破防 */
    isBadDef: boolean
    /** 减免伤害 */
    reductionVal: number
    /** 被动技能触发文本 */
    passiveMsg: string[]
}

class Damage {
    config: DamageConfig
    constructor(agent: { self: BattleAttribute, goal: BattleAttribute }, realHarm: boolean = false) {
        this.config = {
            agent: { self: { ...agent.self }, goal: { ...agent.goal } },
            linkAgent: { self: agent.self, goal: agent.goal },
            harm: 0,
            default_harm: 0,
            isRealHarm: realHarm,
            isEvasion: false,
            isCsp: false,
            isBadDef: false,
            reductionVal: 0,
            passiveMsg: []
        }

    }
    /** 伤害判定前 */
    before(fn: (config: DamageConfig) => void) {
        this.config.default_harm = this.config.agent.self.atk + this.config.agent.self.gain.atk
        fn && fn(this.config)
        return this
    }
    /** 真实伤害判定 */
    beforRealHarm(fn: (config: DamageConfig) => void) {
        fn && fn(this.config)
        if (this.config.isRealHarm) {
            this.config.harm = this.config.default_harm
        }
        return this
    }
    /** 是否闪避判定 */
    evasion(fn: (config: DamageConfig) => void) {
        const { self, goal } = this.config.agent
        // 真实伤害不进行闪避判定
        if (this.config.isRealHarm) return this

        // 最大闪避 95%
        // 等级差距：每大于5级敌方闪避 +20，小于反之
        const lvSup = () => Math.floor((goal.lv - self.lv) / 5) * 20
        const evaVal = Math.min(95, ((goal.evasion + goal.gain.evasion) - (self.hit - 1000) + lvSup()) / 10)

        // 是否闪避成功
        if (random(0, 100) <= evaVal) {
            this.config.isEvasion = true;
            fn && fn(this.config)
            return this
        }
        fn && fn(this.config)
        return this
    }
    /** 是否暴击判定 */
    csp(fn: (config: DamageConfig) => void) {
        const { self, goal } = this.config.agent
        // 真实伤害不进行暴击判定
        if (this.config.isRealHarm) return this
        // 闪避成功不计算暴击
        if (this.config.isEvasion) return this
        const cspVal = ((self.chr + self.gain.chr) - goal.csr) / 10
        // 是否暴击成功
        if (random(0, 100) <= cspVal) {
            this.config.isCsp = true;
            this.config.harm = Math.floor(this.config.default_harm * (self.ghd + self.gain.ghd))
            fn && fn(this.config)
            return this
        }
        this.config.harm = this.config.default_harm
        fn && fn(this.config)
        return this
    }
    /** 防御结算 */
    beforDef(fn: (config: DamageConfig) => void) {
        const { goal } = this.config.agent
        // 真实伤害不进行防御判定
        if (this.config.isRealHarm) return this
        // 闪避成功不计算防御扣除
        if (this.config.isEvasion) return this
        const dpVal = (goal.def + goal.gain.def)
        fn && fn(this.config)
        if (this.config.harm - dpVal > 0) {
            this.config.harm -= dpVal
        } else {
            this.config.isBadDef = true
            this.config.harm = 1
        }

        return this
    }
    /** 最终结算 伤害减免 */
    beforEnd(fn: (config: DamageConfig) => void) {
        if (!this.config.isRealHarm) {
            this.config.reductionVal = Math.floor(this.config.agent.goal.gain.reduction * this.config.harm)
            this.config.harm -= this.config.reductionVal
            if (this.config.harm < 0) {
                this.config.harm = 0
            }
        }
        fn && fn(this.config)
        // 是否存在攻击类型被动技能
        if (!this.config.isRealHarm && this.config.linkAgent.self.passiveList?.length) {
            this.config.linkAgent.self.passiveList.forEach((passiveName) => {
                if (PassiveFn[passiveName].type == 'atk') {
                    const msg = PassiveFn[passiveName].damageFn(this.config)
                    msg && this.config.passiveMsg.push(msg)
                }
            })
        }
        return this
    }
    result(fn?: DamageCallback) {
        this
            .before((val) => {
                fn?.before && fn.before(val)
            })
            .beforRealHarm((val) => {
                fn?.beforRealHarm && fn.beforRealHarm(val)
            })
            .evasion((val) => {
                fn?.evasion && fn.evasion(val)
            }).csp((val) => {
                fn?.csp && fn.csp(val)
            }).beforDef((val) => {
                fn?.beforDef && fn.beforDef(val)
            }).beforEnd((val) => {
                fn?.beforEnd && fn.beforEnd(val)
            })
        return this.config
    }
}

class BuffDamage {
    goal: BattleAttribute
    val: number
    isRealHarm: boolean
    constructor(val: number, goal: BattleAttribute, isRealHarm = false) {
        this.goal = goal
        this.val = val
        this.isRealHarm = isRealHarm
    }
    giveDamage() {
        if (this.isRealHarm) {
            const val = this.goal.hp - this.val > 0 ? this.val : this.goal.hp
            this.goal.hp -= val
            return val
        } else {
            const def = (this.goal.def + this.goal.gain.def)
            const val = (this.goal.hp + def) - this.val > 0 ? this.val - def : this.goal.hp
            this.goal.hp -= val
            return val
        }
    }
}

/** 给予目标伤害 */
function giveDamage(self: BattleAttribute, goal: BattleAttribute, damage: DamageConfig) {
    // 是否存在防御类被动技能
    if (!damage.isRealHarm && damage.linkAgent.goal.passiveList?.length) {
        damage.linkAgent.goal.passiveList.forEach((passiveName) => {
            if (PassiveFn[passiveName].type == 'hit') {
                const msg = PassiveFn[passiveName].damageFn(damage)
                msg && damage.passiveMsg.push(msg)
            }
        })
    }
    if (goal.hp - damage.harm > 0) {
        goal.hp -= damage.harm
        return damage.harm
    } else {
        const lostHp = goal.hp
        goal.hp = 0
        return lostHp
    }
}

/** 治疗目标 */
function giveCure(goal: BattleAttribute, val: number, fn?: (msg: string) => void) {
    const buffMsg = []
    console.log(goal.buff);

    Object.keys(goal.buff).forEach((buff) => {
        if (BuffFn[buff]?.cureFn) {
            const msg = BuffFn[buff].cureFn(goal)
            msg && buffMsg.push(msg)
        }
    })
    const upVal = goal.hp + val
    if (upVal < goal.maxHp + goal.gain.maxHp) {
        goal.hp = upVal
        fn && fn(buffMsg.join('、'))
        return { val, buffMsg: buffMsg.join('、') }
    } else {
        const abHp = (goal.maxHp + goal.gain.maxHp) - goal.hp
        goal.hp += abHp
        fn && fn(buffMsg.join('、'))
        return { val: abHp, buffMsg: buffMsg.join('、') }
    }
}

/** 伤害额外信息 */
function moreDamageInfo(damage: DamageConfig) {
    return (damage.isCsp ? `（暴击！）` : '')
        + (damage.isEvasion ? `（闪避！）` : '')
        + (damage.isBadDef ? `（未破防！）` : '')
        + (damage.isRealHarm ? `(真实伤害)` : '')
}

/** 更多的伤害提示信息 */
function baseMoreDamage(damageInfo: DamageConfig) {
    return moreDamageInfo(damageInfo) + (damageInfo.passiveMsg.length ? '\n' + damageInfo.passiveMsg.join('‣') : '')
}
export { Damage, BuffDamage, giveDamage, giveCure, moreDamageInfo, baseMoreDamage }
