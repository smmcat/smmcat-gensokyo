import { BattleAttribute, getLineupName } from "../battle";
import { Damage, DamageConfig, moreDamageInfo } from "../damage";
import { getFreeList, random } from "../utlis";
import { giveBuff } from "./buffFn";

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
            return `${getLineupName(agent.self)} 释放重砍，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + moreDamageInfo(damageData)
        }
    },
    "突刺": {
        name: "突刺",
        type: SkillType.伤害技,
        info: '[伤害技]消耗10MP，对敌方一个单位造成基于攻击力1.2倍伤害，该伤害无视敌方闪避10%',
        lv: 3,
        mp: 10,
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
            return `${getLineupName(agent.self)} 释放突刺，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + moreDamageInfo(damageData)
        }
    },
    "水炮": {
        name: "水炮",
        type: SkillType.伤害技,
        info: '[伤害技]消耗10MP，通过凝集魔力对敌方造成基于攻击力1.2倍伤害，该伤害基于当前剩余魔法值10%额外叠加伤害。',
        lv: 3,
        mp: 10,
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
            return `${getLineupName(agent.self)} 释放水炮，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + moreDamageInfo(damageData)
        }
    },
    "濒死一击": {
        name: "濒死一击",
        type: SkillType.伤害技,
        info: '[伤害技]血量低于40%可释放，消耗20MP，对敌方一个单位造成基于攻击力2倍伤害。该次伤害暴击率提高20%',
        lv: 3,
        mp: 20,
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
                return `${getLineupName(agent.self)} 释放濒死一击，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + moreDamageInfo(damageData)
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
        fn: function (agent, agentList, fn?) {
            const selectGoal = agent.goal
            if (agent.goal.hp <= 0) {
                return `${getLineupName(agent.self)}已阵亡，无法恢复...`
            }
            fn({
                value: 40,
                target: [selectGoal],
                type: SkillType.治疗技,
                isNext: false
            })
            return `${getLineupName(agent.self)}释放初级治愈，${getLineupName(agent.goal)}恢复40HP`
        }
    },
    "垂死挣扎": {
        name: "垂死挣扎",
        type: SkillType.伤害技,
        info: '对目标造成1.5倍伤害',
        lv: 1,
        mp: 20,
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
            return `${getLineupName(agent.self)} 进行垂死挣扎，对 ${getLineupName(agent.goal)} 造成 ${damageData.harm} 伤害。` + moreDamageInfo(damageData)
        }
    },
    "治愈之光": {
        name: "治愈之光",
        type: SkillType.增益技,
        info: '为目标挂上3回合治愈状态',
        lv: 1,
        mp: 20,
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
                    moreDamageInfo(damageData))
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
                moreDamageInfo(damageData)
        }
    },
    "恐怖的回忆": {
        name: "恐怖的回忆",
        type: SkillType.减益技,
        info: '对单个目标附加破绽状态（额外受到30%伤害），持续2回合',
        lv: 1,
        mp: 30,
        fn: function (agent, agentList, fn?) {
            giveBuff(agent.goal, { name: "破绽", timer: 2 })
            fn({
                type: SkillType.减益技,
                isNext: false
            })
            return `${getLineupName(agent.self)} 发动恐怖的回忆！对 ${getLineupName(agent.goal)} 附加了2回合破绽状态。`
        }
    }
};