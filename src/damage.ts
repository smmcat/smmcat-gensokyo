import { BattleAttribute } from "./battle";
import { BuffFn } from "./data/buffFn";
import { PassiveFn } from "./data/PassiveFn";
import { random } from "./utlis";


type DamageCallback = {
    /** 初始化信息阶段前 */
    before?: Callback;
    /** 是否真实伤害判断前 */
    beforRealHarm?: Callback;
    /** 闪避结果事件后 */
    evasion?: Callback;
    /** 暴击结果事件后 */
    csp?: Callback;
    /** 防御抵扣伤害前 */
    beforDef?: Callback;
    /** 最终结算伤害前（被动触发前） */
    beforEnd?: Callback
}

/** 当前伤害回调函数 */
interface Callback {
    (data: DamageConfig): void;
}

export type DamageConfig = {
    /** 浅拷贝数据 */
    agent: { self: BattleAttribute, goal: BattleAttribute }
    /** 深拷贝数据 */
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
    /** 实际扣除的生命值（受击后被动使用） */
    hpLoss: number
    /** 护盾抵挡的伤害值 */
    shieldLoss: number
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
            hpLoss: 0,
            shieldLoss: 0,
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
        // 目标存在护盾时无法被暴击
        if (this.config.linkAgent.goal.shield > 0) {
            this.config.harm = this.config.default_harm
            fn && fn(this.config)
            return this
        }
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
            this.config.reductionVal = Math.floor((this.config.agent.goal.reduction + this.config.agent.goal.gain.reduction) * this.config.harm)
            this.config.harm -= this.config.reductionVal
            if (this.config.harm < 0) {
                this.config.harm = 0
            }
        }
        fn && fn(this.config)
        // 是否存在攻击类型被动技能
        const allPassiveList = [...this.config.linkAgent.self.equipmentPassiveList, ...this.config.linkAgent.self.passiveList]
        if (!this.config.isRealHarm && allPassiveList.length) {
            allPassiveList.forEach((passiveName) => {
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
    giveDamage(): { val: number, msgs: string[] } {
        const msgs: string[] = []
        let harm: number
        if (this.isRealHarm) {
            harm = this.goal.hp - this.val > 0 ? this.val : this.goal.hp
            this.goal.hp -= harm
        } else {
            const def = (this.goal.def + this.goal.gain.def)
            harm = (this.goal.hp + def) - this.val > 0 ? this.val - def : this.goal.hp
            harm = Math.max(0, harm)
            // 非真实伤害优先扣除护盾
            if (this.goal.shield > 0) {
                const shieldAbsorb = Math.min(this.goal.shield, harm)
                this.goal.shield -= shieldAbsorb
                harm -= shieldAbsorb
            }
            this.goal.hp -= harm
        }
        // 受击后被动（hited）：DoT 等持续伤害结算后同样触发
        msgs.push(...triggerHitedPassives(this.goal, harm))
        return { val: harm, msgs }
    }
}

/** 触发目标的受击后（hited）被动，返回触发消息列表 */
function triggerHitedPassives(goal: BattleAttribute, hpLoss: number): string[] {
    const msgs: string[] = []
    const passiveList = [...(goal.equipmentPassiveList || []), ...(goal.passiveList || [])]
    passiveList.forEach((passiveName) => {
        const passive = PassiveFn[passiveName]
        if (passive && passive.type == 'hited') {
            const config = {
                agent: { self: goal, goal },
                linkAgent: { self: goal, goal },
                hpLoss,
                harm: hpLoss,
                passiveMsg: msgs
            } as unknown as DamageConfig
            const msg = passive.damageFn(config)
            msg && msgs.push(msg)
        }
    })
    return msgs
}

/** 给予目标伤害 */
function giveDamage(self: BattleAttribute, goal: BattleAttribute, damage: DamageConfig) {
    // 受击前被动（hit）：扣血前触发，可读取本次伤害值
    const allPressiveList = [...damage.linkAgent.goal.equipmentPassiveList, ...damage.linkAgent.goal.passiveList]
    if (!damage.isRealHarm && allPressiveList.length) {
        allPressiveList.forEach((passiveName) => {
            if (PassiveFn[passiveName].type == 'hit') {
                const msg = PassiveFn[passiveName].damageFn(damage)
                msg && damage.passiveMsg.push(msg)
            }
        })
    }
    let remainingHarm = damage.harm
    // 非真实伤害优先扣除护盾，溢出部分计算到实际HP
    let shieldAbsorb = 0
    if (!damage.isRealHarm && goal.shield > 0) {
        shieldAbsorb = Math.min(goal.shield, remainingHarm)
        goal.shield -= shieldAbsorb
        remainingHarm -= shieldAbsorb
    }
    damage.shieldLoss = shieldAbsorb
    // 扣除实际生命值
    let hpLoss: number
    if (goal.hp - remainingHarm > 0) {
        goal.hp -= remainingHarm
        hpLoss = remainingHarm
    } else {
        hpLoss = goal.hp
        goal.hp = 0
    }
    // 受击后被动（hited）：实际扣血完成后触发，基于真实扣血量与扣血后状态
    damage.hpLoss = hpLoss
    if (allPressiveList.length) {
        allPressiveList.forEach((passiveName) => {
            if (PassiveFn[passiveName].type == 'hited') {
                const msg = PassiveFn[passiveName].damageFn(damage)
                msg && damage.passiveMsg.push(msg)
            }
        })
    }
    return hpLoss
}

/** 给予目标护盾（护盾不能大于最大血量） */
function giveShield(goal: BattleAttribute, val: number) {
    goal.shield = Math.min(goal.maxHp, Math.max(0, goal.shield + val))
    return goal.shield
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
    if (upVal < goal.maxHp) {
        goal.hp = upVal
        fn && fn(buffMsg.join('、'))
        return { val, buffMsg: buffMsg.join('、') }
    } else {
        const abHp = (goal.maxHp) - goal.hp
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
        + (damage.shieldLoss > 0 ? `（抵挡 ${damage.shieldLoss}）` : '')
}

/** 更多的伤害提示信息 */
function baseMoreDamage(damageInfo: DamageConfig) {
    return moreDamageInfo(damageInfo) + (damageInfo.passiveMsg.length ? '\n' + damageInfo.passiveMsg.join('\n') : '')
}
export { Damage, BuffDamage, giveDamage, giveCure, giveShield, moreDamageInfo, baseMoreDamage }
