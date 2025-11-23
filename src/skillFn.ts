import { BattleAttribute, getLineupName } from "./battle";
import { Damage, DamageConfig, moreDamageInfo } from "./damage";

export enum SkillType {
    释放失败 = '释放失败',
    伤害技 = '伤害技',
    增益技 = '增益技',
    治疗技 = '治疗技',
    奥义 = '奥义'
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

interface BuffSkillParams {
    type: SkillType.增益技;
    buffs: { val: number, time: number, name: number }[];
    target: BattleAttribute | BattleAttribute[],
    /** 是否衔接普攻 */
    isNext: boolean;
}

interface HealSkillParams {
    type: SkillType.治疗技,
    /** 是否衔接普攻 */
    isNext: boolean;
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
    | ErrSkillParams;

interface SkillConfig<T extends SkillType = SkillType> {
    /** 技能名 */
    name: string;
    /** 技能类型 */
    type: T;
    /** 技能说明 */
    info: string;
    /** 消耗MP */
    mp: number;
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
        mp: 10,
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
    "濒死一击": {
        name: "濒死一击",
        type: SkillType.伤害技,
        info: '[伤害技]血量低于40%可释放，消耗20MP，对敌方一个单位造成基于攻击力2倍伤害。该次伤害暴击率提高20%',
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
    }
};