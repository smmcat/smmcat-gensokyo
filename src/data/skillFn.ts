import { BattleAttribute, getLineupName } from "../battle";
import { baseMoreDamage, BuffDamage, Damage, DamageConfig, giveDamage } from "../damage";
import { User } from "../users";
import { getFreeList, random } from "../utlis";
import { BuffFn, BuffType, clearBuff, clearImprint, giveBuff } from "./buffFn";

export enum SkillType {
    释放失败 = '释放失败',
    伤害技 = '伤害技',
    增益技 = '增益技',
    减益技 = '减益技',
    治疗技 = '治疗技',
    奥义 = '奥义'
}

export enum UserOccupation {
    剑士 = "剑士",
    法师 = "法师",
    刺客 = "刺客"
}

interface DamageSkillParams {
    /** 伤害类型 */
    type: SkillType.伤害技;
    /** 伤害信息 */
    damage: DamageConfig;
    /** 释放目标 */
    target: BattleAttribute[]
    /** 是否衔接普攻 */
    isNext: boolean;
}


interface HealSkillParams {
    type: SkillType.治疗技,
    /** 是否衔接普攻 */
    isNext: boolean;
    /** 治疗量 */
    value: number
    target: BattleAttribute[]
}

interface BuffSkillParams {
    type: SkillType.增益技;
    /** 是否衔接普攻 */
    isNext: boolean;
    /** 错误提示 */
    err?: string
}

interface DeBuffSkillParams {
    type: SkillType.减益技;
    /** 是否衔接普攻 */
    isNext: boolean;
    /** 错误提示 */
    err?: string
}

interface UltimateSkillParams {
    type: SkillType.奥义,
    /** 是否衔接普攻 */
    isNext: boolean;
}

interface ErrSkillParams {
    type: SkillType.释放失败,
    /** 是否衔接普攻 */
    isNext: boolean;
    /** 错误提示 */
    err?: string
}

type SkillParams =
    | DamageSkillParams
    | BuffSkillParams
    | HealSkillParams
    | UltimateSkillParams
    | ErrSkillParams
    | DeBuffSkillParams

interface SkillConfig<T extends SkillType = SkillType> {
    /** 技能名 */
    name: string;
    /** 技能类型 */
    type: T;
    /** 技能说明 */
    info: string;
    /** 等级限制 */
    lv: number,
    /** 使用次数限制 */
    useTime: number,
    /** 消耗MP */
    mp: number;
    /** 职业专属 */
    feature?: UserOccupation[],
    /** 技能函数 */
    fn(
        agent: { self: BattleAttribute, goal: BattleAttribute },
        agentList: { selfList: BattleAttribute[], goalList: BattleAttribute[] },
        cb?: (val: Extract<SkillParams, { type: T }>) => void
    ): string;
}

type SkillFn = {
    [key: string]: SkillConfig;
}

export type UseAtkType = keyof typeof skillFn | '普攻';
export const skillFn: SkillFn = {
    "重砍": {
        name: "重砍",
        type: SkillType.伤害技,
        info: '[伤害技]消耗10MP，对敌方一个单位造成基于攻击力1.2倍伤害。该次伤害无视敌方30%防御！（最低无视1防御）',
        lv: 3,
        mp: 10,
        useTime: 6,
        feature: [UserOccupation.剑士],
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm += Math.floor(val.default_harm * 0.2)
                    val.agent.goal.def -= Math.floor(val.agent.goal.def * 0.3) || 1
                })
            })
            fn({
                damage: damageData,
                type: this.type,
                target: [agent.goal],
                isNext: false
            })
            return `${getLineupName(agent.self)} 释放重砍，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "突刺": {
        name: "突刺",
        type: SkillType.伤害技,
        info: '[伤害技]消耗10MP，对敌方一个单位造成基于攻击力1.2倍伤害，该伤害无视敌方闪避10%',
        lv: 3,
        mp: 10,
        useTime: 6,
        feature: [UserOccupation.刺客],
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm += Math.floor(val.default_harm * 0.2)
                    val.agent.goal.evasion -= Math.floor((val.agent.goal.evasion + val.agent.goal.gain.evasion) * 0.1)
                })
            })
            fn({
                damage: damageData,
                type: this.type,
                target: [agent.goal],
                isNext: false
            })
            return `${getLineupName(agent.self)} 释放突刺，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "水炮": {
        name: "水炮",
        type: SkillType.伤害技,
        info: '[伤害技]消耗10MP，通过凝集魔力对敌方造成基于攻击力1.2倍伤害，该伤害基于当前剩余魔法值10%额外叠加伤害。',
        lv: 3,
        mp: 10,
        useTime: 6,
        feature: [UserOccupation.法师],
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm += Math.floor(val.default_harm * 0.2) + Math.floor(val.agent.self.mp * 0.1)
                })
            })
            fn({
                damage: damageData,
                type: this.type,
                target: [agent.goal],
                isNext: false
            })
            return `${getLineupName(agent.self)} 释放水炮，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "濒死一击": {
        name: "濒死一击",
        type: SkillType.伤害技,
        info: '[伤害技]血量低于40%可释放，消耗20MP，对敌方一个单位造成基于攻击力2倍伤害。该次伤害暴击率提高20%',
        lv: 3,
        mp: 20,
        useTime: 6,
        fn: function (agent, agentList, fn?) {
            if (agent.self.hp / (agent.self.maxHp + agent.self.gain.maxHp) < 0.4) {
                const damageData = new Damage(agent).result({
                    before: ((val) => {
                        val.default_harm += val.default_harm
                        val.agent.self.chr += 200
                    })
                })
                fn({
                    damage: damageData,
                    type: this.type,
                    target: [agent.goal],
                    isNext: false
                })
                return `${getLineupName(agent.self)} 释放濒死一击，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
            } else {
                fn({
                    type: SkillType.释放失败,
                    isNext: true,
                    err: '释放失败，未达成条件。'
                })
                return ``
            }
        }
    },
    "初级治愈": {
        name: "初级治愈",
        type: SkillType.治疗技,
        info: '[治疗技]直接恢复自身或者目标 40HP',
        lv: 1,
        mp: 30,
        useTime: 6,
        fn: function (agent, agentList, fn?) {
            const selectGoal = agent.goal
            const cureVal = Math.floor(40 + 40 * (agent.goal.TreatmentUp + agent.goal.gain.TreatmentUp))

            if (agent.goal.hp <= 0) {
                return `${getLineupName(agent.self)}已阵亡，无法恢复...`
            }
            fn({
                value: cureVal,
                target: [selectGoal],
                type: SkillType.治疗技,
                isNext: false
            })
            return `${getLineupName(agent.self)}释放初级治愈，${getLineupName(agent.goal)}恢复${cureVal}HP`
        }
    },
    "垂死挣扎": {
        name: "垂死挣扎",
        type: SkillType.伤害技,
        info: '对目标造成1.5倍伤害',
        lv: 1,
        mp: 20,
        useTime: 3,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm += Math.floor(val.default_harm * 0.5)
                })
            })
            fn({
                damage: damageData,
                type: this.type,
                target: [agent.goal],
                isNext: false
            })
            return `${getLineupName(agent.self)} 进行垂死挣扎，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "治愈之光": {
        name: "治愈之光",
        type: SkillType.增益技,
        info: '为目标挂上3回合治愈状态',
        lv: 1,
        mp: 20,
        useTime: 6,
        fn: function (agent, agentList, fn?) {
            giveBuff(agent.goal, { name: "治愈", timer: 3 })
            fn({
                type: SkillType.增益技,
                isNext: true
            })
            return `${getLineupName(agent.self)} 对 ${getLineupName(agent.goal)} 释放治愈之光。`
        }
    },
    "毒之牙": {
        name: "毒之牙",
        type: SkillType.伤害技,
        info: '对敌方最多3个目标造成攻击力1.2倍伤害，造成伤害时有50%概率为敌方附加3回合中毒状态。',
        lv: 1,
        mp: 40,
        useTime: 3,
        fn: function (agent, agentList, fn?) {
            const goalList = getFreeList(agentList.goalList).slice(0, 3).filter(i => i) as BattleAttribute[]
            const msgList = [`${getLineupName(agent.self)}释放了群体技能毒之牙！`]
            goalList.forEach((goal) => {
                let useBuff = false
                const damageData = new Damage({ self: agent.self, goal }).result({
                    before: ((val) => {
                        val.default_harm += Math.floor(val.default_harm * 0.2)
                    }),
                    beforEnd: ((val) => {
                        if (val.harm && random(0, 10) < 5) {
                            useBuff = true
                            giveBuff(goal, { name: "中毒", timer: 3 })
                        }
                    })
                })
                fn({
                    type: SkillType.伤害技,
                    damage: damageData,
                    isNext: false,
                    target: [goal]
                })
                msgList.push(`- 对 ${getLineupName(goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(中毒)' : ''}` +
                    baseMoreDamage(damageData))
            })
            return msgList.join('\n')
        }
    },
    "恐怖催眠术": {
        name: "恐怖催眠术",
        type: SkillType.伤害技,
        info: '对单个目标造成(攻击1.5倍+自身命中值10%)伤害，造成伤害有60%概率使其晕眩2回合。',
        lv: 1,
        mp: 40,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            let useBuff = false
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm += Math.floor(val.default_harm * 0.2) +
                        Math.floor((val.agent.self.hit + val.agent.self.gain.hit) * 0.1)
                }),
                beforEnd: ((val) => {
                    if (val.harm && random(0, 10) < 6) {
                        useBuff = true
                        giveBuff(agent.goal, { name: "晕眩", timer: 3 })
                    }
                })
            })
            fn({
                type: SkillType.伤害技,
                damage: damageData,
                isNext: false,
                target: [agent.goal]
            })
            return `${getLineupName(agent.self)} 发动恐怖催眠术！对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(晕眩)' : ''}` +
                baseMoreDamage(damageData)
        }
    },
    "恐怖的回忆": {
        name: "恐怖的回忆",
        type: SkillType.减益技,
        info: '对单个目标附加破绽状态（额外受到30%伤害），持续2回合',
        lv: 1,
        mp: 30,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            giveBuff(agent.goal, { name: "破绽", timer: 2 })
            fn({
                type: SkillType.减益技,
                isNext: false
            })
            return `${getLineupName(agent.self)} 发动恐怖的回忆！对 ${getLineupName(agent.goal)} 附加了2回合破绽状态。`
        }
    },
    "初级驱散": {
        name: "初级驱散",
        type: SkillType.治疗技,
        info: '[治疗技]随机驱散目标1-2个负面BUFF，每个负面BUFF回复10%血量',
        lv: 5,
        mp: 40,
        useTime: 5,
        fn: function (agent, agentList, fn?) {
            const selectGoal = agent.goal
            if (selectGoal.hp <= 0) {
                return `${getLineupName(agent.self)}已阵亡...`
            }
            const deBuffList = Object.keys(selectGoal.buff).filter((buff) => {
                return [BuffType.减益, BuffType.伤害, BuffType.控制].includes(BuffFn[buff].type)
            })

            if (deBuffList.length) {
                return `${getLineupName(agent.self)}释放初级驱散，对${getLineupName(selectGoal)}似乎没什么作用...`
            }
            let upVal = 0
            const selectBuff = getFreeList(deBuffList).slice(0, random(1, 2))
            selectBuff.forEach((buffName) => {
                const type = clearBuff(selectGoal, { name: buffName })
                !type.err && upVal++
            })

            let value = Math.floor(upVal * (selectGoal.maxHp * 0.1))
            fn({
                value,
                target: [selectGoal],
                type: SkillType.治疗技,
                isNext: false
            })
            return `${getLineupName(agent.self)}释放初级驱散，${getLineupName(agent.goal)}被驱散了${upVal}个负面状态，并恢复${value}HP`
        }
    },
    "紧闭的恋之瞳": {
        name: "紧闭的恋之瞳",
        type: SkillType.减益技,
        info: '[减益技]怪物特有技能：为玩家目标添加5回合的⌈咒⌋印记，当对方持有3个⌈咒⌋印记，将直接死亡。⌈咒⌋可以有50%概率会被技能类型的治疗驱散',
        lv: 5,
        mp: 40,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            if (agent.self.type == '玩家' || agent.goal.type == '怪物') {
                fn({
                    type: SkillType.释放失败,
                    isNext: true,
                    err: '释放失败，技能只能怪物指向玩家。'
                })
                return ``
            }
            giveBuff(agent.goal, { name: "咒", timer: 5 })
            const key = BuffFn['咒'].key
            fn({
                type: SkillType.减益技,
                isNext: false
            })
            // 条件达成时，目标即死
            if (agent.goal.expand[key].val >= 3) {
                agent.goal.hp = 0;
                clearImprint(agent.goal, { name: '咒' })
                return `${getLineupName(agent.self)}释放紧闭的恋之瞳，${getLineupName(agent.goal)}⌈咒⌋层达到3层，立即死亡!`
            }
            return `${getLineupName(agent.self)}释放紧闭的恋之瞳，${getLineupName(agent.goal)}⌈咒⌋层数${agent.goal.expand[key].val}层`
        }
    },
    "无意识行动": {
        name: "无意识行动",
        type: SkillType.伤害技,
        info: '[减益技]怪物特有技能：只有关闭恋の瞳的妖怪可用。造成(攻击1.5倍+自身闪避值5%)伤害，造成伤害有60%概率使其沉默2回合。',
        lv: 5,
        mp: 40,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            if (agent.self.type == '玩家' || agent.goal.type == '怪物') {
                fn({
                    type: SkillType.释放失败,
                    isNext: true,
                    err: '释放失败，技能只能怪物指向玩家。'
                })
                return ``
            }
            let useBuff = false
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm += Math.floor(val.default_harm * 0.2) +
                        Math.floor((val.agent.self.speed + val.agent.self.gain.speed) * 0.05)
                }),
                beforEnd: ((val) => {
                    if (val.harm && random(0, 10) < 6) {
                        useBuff = true
                        giveBuff(agent.goal, { name: "沉默", timer: 3 })
                    }
                })
            })
            fn({
                type: SkillType.伤害技,
                damage: damageData,
                isNext: false,
                target: [agent.goal]
            })
            return `${getLineupName(agent.self)} 发动无意识行动！对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(沉默)' : ''}` +
                baseMoreDamage(damageData)
        }
    },
    "瓦尼瓦尼": {
        name: "瓦尼瓦尼",
        type: SkillType.伤害技,
        info: '[伤害技]怪物特有技能：对目标使用Intulit Mortem（瓦尼瓦尼）。造成连续两次并后续每次都会有40%概率追加单体攻击的伤害。每次攻击造成(40%攻击力+5%自身剩余MP)的伤害。',
        lv: 5,
        mp: 60,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            if (agent.self.type == '玩家' || agent.goal.type == '怪物') {
                fn({
                    type: SkillType.释放失败,
                    isNext: true,
                    err: '释放失败，技能只能怪物指向玩家。'
                })
                return ``
            }
            const msgList = [`${getLineupName(agent.self)}对${getLineupName(agent.goal)}释放Intulit Mortem！`]

            // 固定伤害
            for (let index = 0; index < 2; index++) {
                const damageData = new Damage(agent).result({
                    before: ((val) => {
                        val.default_harm = Math.floor((agent.self.atk + agent.self.gain.atk) * 0.4) +
                            Math.floor(agent.self.mp * 0.05)
                    })
                })
                fn({
                    type: SkillType.伤害技,
                    damage: damageData,
                    isNext: false,
                    target: [agent.goal]
                })
                msgList.push(`- ${getLineupName(agent.goal)} 受到 ${damageData.harm} 伤害。` +
                    baseMoreDamage(damageData))
            }
            // 追加伤害
            while (random(0, 10) <= 4 && agent.goal.hp > 0) {
                const damageData = new Damage(agent).result({
                    before: ((val) => {
                        val.default_harm = Math.floor((agent.self.atk + agent.self.gain.atk) * 0.3) +
                            Math.floor(agent.self.mp * 0.05)
                    })
                })
                fn({
                    type: SkillType.伤害技,
                    damage: damageData,
                    isNext: false,
                    target: [agent.goal]
                })
                msgList.push(`- ${getLineupName(agent.goal)} 受到 ${damageData.harm} 伤害。` +
                    baseMoreDamage(damageData))
            }
            return msgList.join('\n')
        }
    },
    "霜月架势": {
        name: "霜月架势",
        type: SkillType.伤害技,
        info: '将收刀进入 霜月架势 并开始蓄力，对目标全体（最大4名）造成 200%基础攻击力 伤害。触发技能前记录当前所有 ⌈落霜⌋ 印记，每消耗1个 ⌈落霜⌋ 印记，该次伤害增加20%，当消耗达到6印记时，有 60% 概率对目标添加 2回合 ⌈破绽⌋ 状态',
        lv: 10,
        mp: 120,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            if (agent.goal.type == '怪物' && agent.self.expand['frost-buff']?.val <= 2) {
                fn({
                    type: SkillType.释放失败,
                    isNext: true,
                    err: ''
                })
                return ``
            }
            // 确认伤害总额
            let useAtk = Math.floor(agent.self.atk * 2)
            useAtk += Math.floor(useAtk * 0.2 * (agent.self.expand['frost-buff']?.val || 0))

            // 筛选目标
            const goalList = getFreeList(agentList.goalList).slice(0, 4).filter(i => i) as BattleAttribute[]
            const msgList = [`${getLineupName(agent.self)}释放了群体技能霜月架势！`]

            // 依次结算
            goalList.forEach((goal) => {
                let useBuff = false
                const damageData = new Damage({ self: agent.self, goal }).result({
                    before: ((val) => {
                        val.default_harm = useAtk
                    }),
                    beforEnd: ((val) => {
                        if (val.harm && agent.self.expand['frost-buff']?.val == 6 && random(0, 10) < 6) {
                            useBuff = true
                            giveBuff(goal, { name: "破绽", timer: 2 })
                        }
                    })
                })
                fn({
                    type: SkillType.伤害技,
                    damage: damageData,
                    isNext: false,
                    target: [goal]
                })
                msgList.push(`- 对 ${getLineupName(goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(破绽)' : ''}` +
                    baseMoreDamage(damageData))
            })
            clearImprint(agent.self, { name: "落霜" })
            return msgList.join('\n')
        }
    },
    "飞雪": {
        name: "飞雪",
        type: SkillType.伤害技,
        info: '快速突进，对单个目标发动强力斩击，造成1.3倍伤害。造成伤害时获得2层 ⌈落霜⌋ 印记，印记持续6回合',
        lv: 10,
        mp: 60,
        useTime: 6,
        fn: function (agent, agentList, fn?) {
            let useBuff = false
            const damageData = new Damage({ self: agent.self, goal: agent.goal }).result({
                before: ((val) => {
                    val.default_harm += Math.floor(val.default_harm * 0.3)
                }),
                beforEnd: ((val) => {
                    if (val.harm) {
                        useBuff = true
                        giveBuff(agent.self, { name: "落霜", timer: 6 })
                        giveBuff(agent.self, { name: "落霜", timer: 6 })
                    }
                })
            })
            fn({
                type: SkillType.伤害技,
                damage: damageData,
                isNext: false,
                target: [agent.goal]
            })

            return `${getLineupName(agent.self)} 发动飞雪！对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '并为自己挂上2层 ⌈落霜⌋ 印记' : ''}` +
                baseMoreDamage(damageData)
        }
    },
    "跟你爆了": {
        name: "跟你爆了",
        type: SkillType.伤害技,
        info: '"事到如今，只能自爆了。"\n牺牲自己，直接对目标造成目前 自身当前生命值*1.3 的真实伤害。',
        lv: 10,
        mp: 10,
        useTime: 1,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage({ self: agent.self, goal: agent.goal }, true).result({
                before: ((val) => {
                    val.default_harm = Math.floor(agent.self.hp * 1.3)
                })
            })
            agent.self.hp = 0
            agent.self.userId && User.giveDie(agent.self.userId)
            fn({
                type: SkillType.伤害技,
                damage: damageData,
                isNext: false,
                target: [agent.goal]
            })

            return `${getLineupName(agent.self)} 发动跟你爆了！对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` +
                baseMoreDamage(damageData)
        }
    },
    "夏弥尔之星": {
        name: "夏弥尔之星",
        type: SkillType.伤害技,
        info: "先为自己附加 ⌈福音⌋ 提升自身 30% 暴击率，持续5回合。之后对敌方单个目标造成 1.5 倍伤害。",
        lv: 10,
        mp: 70,
        useTime: 3,
        fn: function (agent, agentList, fn?) {
            giveBuff(agent.self, { name: "福音", timer: 5 })
            const damageData = new Damage({ self: agent.self, goal: agent.goal }).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.5)
                })
            })
            fn({
                type: SkillType.伤害技,
                damage: damageData,
                isNext: false,
                target: [agent.goal]
            })

            return `${getLineupName(agent.self)} 强化自己，并发动夏弥尔之星！对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` +
                baseMoreDamage(damageData)
        }
    },
    "往日深渊的圆舞曲": {
        name: "往日深渊的圆舞曲",
        type: SkillType.伤害技,
        info: "扣除自身 5% 最大生命。对敌方全体造成 1.8 倍的伤害（最多4个），命中有 20% 概率对目标挂上 3 回合 ⌈引燃⌋。",
        lv: 10,
        mp: 70,
        useTime: 3,
        fn: function (agent, agentList, fn?) {
            const costHp = Math.floor(agent.self.maxHp * 0.5)
            if (agent.self.hp <= costHp) {
                fn({
                    type: SkillType.释放失败,
                    isNext: true,
                    err: '血量不够技能消耗！'
                })
                return
            }
            agent.self.hp -= costHp
            const msgList = [`扣除自身${costHp}血量，${getLineupName(agent.self)} 释放 往日深渊的圆舞曲！`]
            agentList.goalList.forEach((goal) => {
                let isBuff = ''
                const damageData = new Damage({ self: agent.self, goal: agent.goal }).result({
                    before: ((val) => {
                        val.default_harm = Math.floor(val.default_harm * 1.5)
                    })
                })
                if (damageData.harm && random(0, 10) <= 2) {
                    isBuff = giveBuff(goal, { name: "引燃", timer: 3 })
                }
                fn({
                    type: SkillType.伤害技,
                    damage: damageData,
                    isNext: false,
                    target: [goal]
                })
                msgList.push(`对 ${getLineupName(goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData) + isBuff)
            })
            agent
            return msgList.join('\n')
        }
    },
    "雾灯刺击": {
        name: "雾灯刺击",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.25 倍攻击伤害，并追加自身闪避值 12% 的伤害。',
        lv: 1,
        mp: 35,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.25) +
                        Math.floor((val.agent.self.evasion + val.agent.self.gain.evasion) * 0.12)
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}点亮雾灯发动刺击，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "齿轮重碾": {
        name: "齿轮重碾",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.35 倍攻击伤害，并追加自身防御值 80% 的伤害。',
        lv: 1,
        mp: 30,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.35) +
                        Math.floor((val.agent.self.def + val.agent.self.gain.def) * 0.8)
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}以齿轮重碾 ${getLineupName(agent.goal)}，造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "墓钟回响": {
        name: "墓钟回响",
        type: SkillType.减益技,
        info: '[怪物特有技能]对目标附加 2 回合破绽，并有 50% 概率附加 2 回合沉默。',
        lv: 1,
        mp: 45,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            giveBuff(agent.goal, { name: "破绽", timer: 2 })
            const silence = random(0, 10) < 5
            if (silence) giveBuff(agent.goal, { name: "沉默", timer: 2 })
            fn({ type: SkillType.减益技, isNext: false })
            return `${getLineupName(agent.self)}敲响墓钟，${getLineupName(agent.goal)}陷入破绽${silence ? '并被沉默' : ''}。`
        }
    },
    "雨巷急袭": {
        name: "雨巷急袭",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.2 倍攻击伤害，并追加自身速度 120% 的伤害。',
        lv: 1,
        mp: 40,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.2) +
                        Math.floor((val.agent.self.speed + val.agent.self.gain.speed) * 1.2)
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}从雨巷中急袭 ${getLineupName(agent.goal)}，造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "雾钟审判": {
        name: "雾钟审判",
        type: SkillType.伤害技,
        info: '[怪物特有技能]对最多 3 个目标造成攻击力 1.45 倍伤害，追加自身命中值 8% 的伤害，30% 概率晕眩。',
        lv: 1,
        mp: 80,
        useTime: 3,
        fn: function (agent, agentList, fn?) {
            const goalList = getFreeList(agentList.goalList).slice(0, 3).filter(i => i) as BattleAttribute[]
            const msgList = [`${getLineupName(agent.self)}发动雾钟审判！`]
            goalList.forEach((goal) => {
                let useBuff = false
                const damageData = new Damage({ self: agent.self, goal }).result({
                    before: ((val) => {
                        val.default_harm = Math.floor(val.default_harm * 1.45) +
                            Math.floor((val.agent.self.hit + val.agent.self.gain.hit) * 0.08)
                    }),
                    beforEnd: ((val) => {
                        if (val.harm && random(0, 10) < 3) {
                            useBuff = true
                            giveBuff(goal, { name: "晕眩", timer: 2 })
                        }
                    })
                })
                fn({ type: SkillType.伤害技, damage: damageData, isNext: false, target: [goal] })
                msgList.push(`- 对 ${getLineupName(goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(晕眩)' : ''}` + baseMoreDamage(damageData))
            })
            return msgList.join('\n')
        }
    },
    "月湾涌流": {
        name: "月湾涌流",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.25 倍攻击伤害，并追加当前 MP 12% 的伤害。',
        lv: 1,
        mp: 45,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.25) + Math.floor(val.agent.self.mp * 0.12)
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}掀起月湾涌流，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "潮歌魅影": {
        name: "潮歌魅影",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.2 倍攻击伤害，追加自身暴击率 30% 的伤害，50% 概率沉默。',
        lv: 1,
        mp: 55,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            let useBuff = false
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.2) +
                        Math.floor((val.agent.self.chr + val.agent.self.gain.chr) * 0.3)
                }),
                beforEnd: ((val) => {
                    if (val.harm && random(0, 10) < 5) {
                        useBuff = true
                        giveBuff(agent.goal, { name: "沉默", timer: 2 })
                    }
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}唱出潮歌魅影，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(沉默)' : ''}` + baseMoreDamage(damageData)
        }
    },
    "锈潮斩": {
        name: "锈潮斩",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.4 倍攻击伤害，并临时无视目标 25% 防御。',
        lv: 1,
        mp: 45,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.4)
                    val.agent.goal.def -= Math.floor((val.agent.goal.def + val.agent.goal.gain.def) * 0.25)
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}挥出锈潮斩，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "月蚀潮汐": {
        name: "月蚀潮汐",
        type: SkillType.伤害技,
        info: '[怪物特有技能]对最多 4 个目标造成攻击力 1.35 倍伤害，追加当前 MP 10% 的伤害，命中后附加引燃。',
        lv: 1,
        mp: 100,
        useTime: 3,
        fn: function (agent, agentList, fn?) {
            const goalList = getFreeList(agentList.goalList).slice(0, 4).filter(i => i) as BattleAttribute[]
            const msgList = [`${getLineupName(agent.self)}引来月蚀潮汐！`]
            goalList.forEach((goal) => {
                let useBuff = false
                const damageData = new Damage({ self: agent.self, goal }).result({
                    before: ((val) => {
                        val.default_harm = Math.floor(val.default_harm * 1.35) + Math.floor(val.agent.self.mp * 0.1)
                    }),
                    beforEnd: ((val) => {
                        if (val.harm) {
                            useBuff = true
                            giveBuff(goal, { name: "引燃", timer: 3 })
                        }
                    })
                })
                fn({ type: SkillType.伤害技, damage: damageData, isNext: false, target: [goal] })
                msgList.push(`- 对 ${getLineupName(goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(引燃)' : ''}` + baseMoreDamage(damageData))
            })
            return msgList.join('\n')
        }
    },
    "星砂闪击": {
        name: "星砂闪击",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.2 倍攻击伤害，并追加自身闪避值 12% 与速度 100% 的伤害。',
        lv: 1,
        mp: 60,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.2) +
                        Math.floor((val.agent.self.evasion + val.agent.self.gain.evasion) * 0.12) +
                        Math.floor(val.agent.self.speed + val.agent.self.gain.speed)
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}化作星砂闪击 ${getLineupName(agent.goal)}，造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "陨铁坠击": {
        name: "陨铁坠击",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.5 倍攻击伤害，并追加自身防御值 100% 的伤害。',
        lv: 1,
        mp: 55,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.5) +
                        Math.floor(val.agent.self.def + val.agent.self.gain.def)
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}砸下陨铁坠击，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData)
        }
    },
    "星核灼光": {
        name: "星核灼光",
        type: SkillType.伤害技,
        info: '[怪物特有技能]造成 1.3 倍攻击伤害，追加自身命中值 10% 的伤害，并有 40% 概率引燃。',
        lv: 1,
        mp: 75,
        useTime: 4,
        fn: function (agent, agentList, fn?) {
            let useBuff = false
            const damageData = new Damage(agent).result({
                before: ((val) => {
                    val.default_harm = Math.floor(val.default_harm * 1.3) +
                        Math.floor((val.agent.self.hit + val.agent.self.gain.hit) * 0.1)
                }),
                beforEnd: ((val) => {
                    if (val.harm && random(0, 10) < 4) {
                        useBuff = true
                        giveBuff(agent.goal, { name: "引燃", timer: 3 })
                    }
                })
            })
            fn({ damage: damageData, type: this.type, target: [agent.goal], isNext: false })
            return `${getLineupName(agent.self)}释放星核灼光，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。${useBuff ? '(引燃)' : ''}` + baseMoreDamage(damageData)
        }
    },
    "坠星裁决": {
        name: "坠星裁决",
        type: SkillType.伤害技,
        info: '[怪物特有技能]对最多 4 个目标造成攻击力 1.6 倍伤害，追加自身暴击率 25% 与命中值 8% 的伤害。',
        lv: 1,
        mp: 140,
        useTime: 3,
        fn: function (agent, agentList, fn?) {
            const goalList = getFreeList(agentList.goalList).slice(0, 4).filter(i => i) as BattleAttribute[]
            const msgList = [`${getLineupName(agent.self)}宣告坠星裁决！`]
            goalList.forEach((goal) => {
                const damageData = new Damage({ self: agent.self, goal }).result({
                    before: ((val) => {
                        val.default_harm = Math.floor(val.default_harm * 1.6) +
                            Math.floor((val.agent.self.chr + val.agent.self.gain.chr) * 0.25) +
                            Math.floor((val.agent.self.hit + val.agent.self.gain.hit) * 0.08)
                    })
                })
                fn({ type: SkillType.伤害技, damage: damageData, isNext: false, target: [goal] })
                msgList.push(`- 对 ${getLineupName(goal)} 造成 ${damageData.harm} 伤害。` + baseMoreDamage(damageData))
            })
            return msgList.join('\n')
        }
    }
};
