import { BattleAttribute, BuffGain, getLineupName } from "../battle";
import { BuffDamage, giveCure } from "../damage";
import { random } from "../utlis";


export enum BuffType {
    增益 = '增益',
    减益 = '减益',
    印记 = '印记',
    控制 = '控制',
    伤害 = '伤害',
    治疗 = '治疗'
}
interface BuffParams {
    type: BuffType.增益,
    up: BuffGain
}


interface DeBuffParams {
    type: BuffType.减益,
    down: BuffGain
}

interface ImprintBuffParams {
    type: BuffType.印记,
    key: string,
    up?: BuffGain,
    down?: BuffGain,
    data?: any
}

interface ControlBuffParams {
    type: BuffType.控制,
    name: '晕眩' | '控制'
}

interface TreatmentBuffParams {
    type: BuffType.治疗,
    val: number
}

interface HarmBuffParams {
    type: BuffType.伤害,
    val: number,
    isRealHarm?: boolean
}

type BuffItemParams =
    | BuffParams
    | DeBuffParams
    | ImprintBuffParams
    | ControlBuffParams
    | TreatmentBuffParams
    | HarmBuffParams;

interface BuffConfig<T extends BuffType = BuffType> {
    /** 被动名 */
    name: string;
    /** 被动类型 */
    type: T;
    /** 被动说明 */
    info: string;
    /** 印记 */
    key?: string,
    /** 附着时触发 */
    initFn?(
        agent: BattleAttribute,
        cb?: (val: Extract<BuffItemParams, { type: T }>) => void
    ): void;
    /** 结算时触发 */
    fn(
        agent: BattleAttribute,
        cb?: (val: Extract<BuffItemParams, { type: T }>) => void
    ): void;
    /** 被治疗时触发 */
    cureFn?(
        agent: BattleAttribute,
        cb?: (val: Extract<BuffItemParams, { type: T }>) => void
    ): string;
}

type BuffFnList = {
    [key: string]: BuffConfig;
}

export const BuffFn: BuffFnList = {
    "治愈": {
        name: "治愈",
        type: BuffType.治疗,
        info: "每回合回复5%最大血量（最低回复1血）",
        fn: function (agent, fn?) {
            if (agent.hp <= 0) return
            const val = Math.floor((agent.maxHp + agent.gain.maxHp) * 0.05) || 1;
            fn && fn({
                type: BuffType.治疗,
                val
            })
        }
    },
    "中毒": {
        name: "中毒",
        type: BuffType.伤害,
        info: "自身每回合受到5%最大血量伤害的真实伤害（最低扣除1血，最高20血）",
        fn: function (agent: BattleAttribute, fn?) {
            if (agent.hp <= 0) return
            const val = Math.min(20, Math.floor((agent.maxHp + agent.gain.maxHp) * 0.05) || 1);
            fn && fn({
                type: BuffType.伤害,
                val,
                isRealHarm: true
            })
        }
    },
    "晕眩": {
        name: "晕眩",
        type: BuffType.控制,
        info: "该回合将无法行动",
        fn: function (agent: BattleAttribute, fn?) {
            fn && fn({
                type: BuffType.控制,
                name: this.name
            })
        }
    },
    "混乱": {
        name: "混乱",
        type: BuffType.控制,
        info: "该回合将无法行动",
        fn: function (agent: BattleAttribute, fn?) {
            fn && fn({
                type: BuffType.控制,
                name: this.name
            })
        }
    },
    "沉默": {
        name: "沉默",
        type: BuffType.控制,
        info: "该回合将只能进行普攻",
        fn: function (agent: BattleAttribute, fn?) {
            fn && fn({
                type: BuffType.控制,
                name: this.name
            })
        }
    },
    "强壮": {
        name: "强壮",
        type: BuffType.增益,
        info: "提高基于自身攻击力10%的临时攻击力，最低1点攻击力",
        fn: function (agent: BattleAttribute, fn?) {
            const val = Math.floor(agent.atk * 0.1);
            fn && fn({
                type: BuffType.增益,
                up: {
                    atk: val
                }
            })
        }
    },
    "弱化": {
        name: "弱化",
        type: BuffType.减益,
        info: "削弱基于自身攻击力10%，但攻击力最低为1点",
        fn: function (agent: BattleAttribute, fn?) {
            const val = Math.floor(agent.atk * 0.1);
            fn && fn({
                type: BuffType.减益,
                down: {
                    atk: val
                }
            })
        }
    },
    "破绽": {
        name: "破绽",
        type: BuffType.减益,
        info: "增加受到的 30% 伤害",
        fn: function (agent: BattleAttribute, fn?) {
            fn && fn({
                type: BuffType.减益,
                down: {
                    reduction: 0.3
                }
            })
        }
    },
    "咒": {
        name: "咒",
        type: BuffType.印记,
        info: "拥有三个咒，目标玩家将即死",
        key: 'curse-buff',
        initFn: function (agent: BattleAttribute, fn?) {
            if (!agent.expand['curse-buff']) agent.expand['curse-buff'] = { val: 0 }
            agent.expand['curse-buff'].val++
        },
        cureFn: function (agent: BattleAttribute, fn?) {
            if (random(0, 1)) {
                clearImprint(agent, { name: '咒' })
                return ` 治疗状态下 ⌈咒⌋ 被成功驱散`
            } else {
                return ``
            }
        },
        fn: function (agent: BattleAttribute, fn?) {
            fn && fn({
                type: BuffType.印记,
                key: 'curse-buff',
                data: {
                    msg: `印记 ⌈咒⌋ 存在${agent.expand['curse-buff'].val}个`
                }
            })
        }
    },
    "落霜": {
        name: "落霜",
        type: BuffType.印记,
        info: "每层 落霜 增加 附着者攻击力 5%，并且消耗每层 ⌈落霜⌋ 均对 霜月架势 技能增加 20% 伤害。最多拥有6点",
        key: 'curse-buff',
        initFn: function (agent: BattleAttribute, fn?) {
            if (!agent.expand['frost-buff']) agent.expand['frost-buff'] = { val: 0 }
            if (agent.expand['frost-buff'].val < 6) agent.expand['frost-buff'].val++
        },
        fn: function (agent: BattleAttribute, fn?) {
            const upatk = Math.floor(agent.atk * 0.05 * (agent.expand['frost-buff']?.val || 0))
            fn && fn({
                type: BuffType.印记,
                key: 'curse-buff',
                up: {
                    atk: upatk
                },
                data: {
                    msg: `印记 ⌈落霜⌋ 存在${agent.expand['frost-buff'].val}个`
                }
            })
        }
    }
}

/** BUFF状态持续时间格式化 */
export function buffTimeFormat(time: number) {
    const dict = { 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
    return dict[time] || '⁺'
}

/** 为目标添加BUFF */
export function giveBuff(agent: BattleAttribute, buff: { name: string, timer: number }) {
    const buffInfo = BuffFn[buff.name] || null
    if (!buffInfo) return
    buffInfo.initFn?.(agent)
    let again = false
    if (agent.buff[buff.name]) again = true
    agent.buff[buff.name] = buff
    const dict = { 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
    return again ? `${getLineupName(agent)}被再次挂上了${buff.name}${buffTimeFormat(buff.timer)}` :
        `${getLineupName(agent)}被挂上了${buff.name}${buffTimeFormat(buff.timer)}`
}

/** 清除目标指定BUFF */
export function clearBuff(agent: BattleAttribute, buff: { name: string }) {
    const buffInfo = BuffFn[buff.name] || null
    if (!buffInfo) return
    if (buffInfo.type == BuffType.印记) {
        return { err: true, msg: '清除失败，印记无法被驱除' }
    }
    if (agent.buff[buff.name]) {
        delete agent.buff[buff.name]
        return { err: false, msg: `清除${buffInfo.name}成功！` }
    }
}

/** 清除目标指定印记 */
export function clearImprint(agent: BattleAttribute, buff: { name: string }) {
    const buffInfo = BuffFn[buff.name] || null
    if (!buffInfo) return
    if (buffInfo.type !== BuffType.印记) {
        return { err: true, msg: '清除失败，非印记' }
    }
    if (agent.buff[buff.name]) {
        delete agent.buff[buff.name]
        delete agent.expand[buffInfo.key]
    }
}

export function settlementBuff(agent: BattleAttribute) {
    if (agent.hp <= 0) return null
    agent.gain.atk = 0
    agent.gain.chr = 0
    agent.gain.def = 0
    agent.gain.evasion = 0
    agent.gain.ghd = 0
    agent.gain.hit = 0
    agent.gain.maxHp = 0
    agent.gain.maxMp = 0
    agent.gain.maxMp = 0
    agent.gain.speed = 0
    agent.gain.reduction = 0
    agent.gain.TreatmentUp = 0
    agent.gain.dizziness = false
    agent.gain.chaos = false
    agent.gain.silence = false

    const msgList = []
    const gainDict = {
        atk: '攻击',
        def: '防御',
        maxHp: '最大生命值',
        maxMp: '最大魔法值',
        chr: '暴击率',
        ghd: '暴击伤害',
        evasion: '闪避值',
        hit: '命中值',
        speed: '速度',
        reduction: "伤害减免"
    }
    Object.keys(agent.buff).forEach((item) => {
        const buffInfo = BuffFn[item] || null
        if (!buffInfo) return
        switch (buffInfo.type) {
            case BuffType.伤害:
                buffInfo.fn(agent, (val: HarmBuffParams) => {
                    const value = new BuffDamage(val.val, agent, val.isRealHarm).giveDamage()
                    msgList.push(`${buffInfo.name}-${value}HP`)
                })
                break;
            case BuffType.治疗:
                buffInfo.fn(agent, (val: TreatmentBuffParams) => {
                    const value = giveCure(agent, val.val)
                    msgList.push(`${buffInfo.name}+${value.val}HP。` + (value.buffMsg ? value.buffMsg : ''))
                })
                break;
            case BuffType.增益:
                const upMsg = []
                buffInfo.fn(agent, (val: BuffParams) => {
                    Object.keys(val.up).forEach((buffName) => {
                        if (agent.gain[buffName] !== undefined) {
                            upMsg.push(val.up[buffName] > 0 ?
                                gainDict[buffName] + '↑' + val.up[buffName] :
                                gainDict[buffName] + '↓' + Math.abs(val.up[buffName])
                            )
                            agent.gain[buffName] += val.up[buffName]
                        }
                    })
                    msgList.push(`${buffInfo.name}:${upMsg.join('、')}`)
                })
                break;
            case BuffType.减益:
                const downMsg = []
                buffInfo.fn(agent, (val: DeBuffParams) => {
                    Object.keys(val.down).forEach((buffName) => {
                        if (agent.gain[buffName] !== undefined) {
                            downMsg.push(val.down[buffName] > 0 ?
                                gainDict[buffName] + '↓' + val.down[buffName] :
                                gainDict[buffName] + '↑' + Math.abs(val.down[buffName])
                            )
                            agent.gain[buffName] -= val.down[buffName]
                        }
                    })
                    msgList.push(`${buffInfo.name}:${downMsg.join('、')}`)
                })
                break;
            case BuffType.控制:
                buffInfo.fn(agent, (val: ControlBuffParams) => {
                    const control = { '晕眩': 'dizziness', '控制': 'chaos', '沉默': 'silence' }
                    if (!control[val.name]) return
                    agent.gain[control[val.name]] = true
                    msgList.push(`当前正在${val.name}中...`)
                })
                break;
            case BuffType.印记:
                const _upMsg = []
                const _downMsg = []
                buffInfo.fn(agent, (val: ImprintBuffParams) => {
                    if (val.up) {
                        Object.keys(val.up).forEach((buffName) => {
                            if (agent.gain[buffName] !== undefined) {
                                _upMsg.push(val.up[buffName] > 0 ?
                                    gainDict[buffName] + '↑' + val.up[buffName] :
                                    gainDict[buffName] + '↓' + Math.abs(val.up[buffName])
                                )
                                agent.gain[buffName] += val.up[buffName]
                            }
                        })
                    }
                    if (val.down) {
                        Object.keys(val.down).forEach((buffName) => {
                            if (agent.gain[buffName] !== undefined) {
                                _downMsg.push(val.down[buffName] > 0 ?
                                    gainDict[buffName] + '↓' + val.down[buffName] :
                                    gainDict[buffName] + '↑' + Math.abs(val.down[buffName])
                                )
                                agent.gain[buffName] -= val.down[buffName]
                            }
                        })
                    }

                    msgList.push((_upMsg.length ? _upMsg.join('、') + ' ' : '') +
                        ((_downMsg.length ? _downMsg.join('、') + ' ' : '')) +
                        val.data.msg
                    )
                })
            default:
                break;
        }
        --agent.buff[item].timer
        if (agent.buff[item].timer == 0) delete agent.buff[item]
    })
    return msgList.length ? msgList.map(item => `» ${getLineupName(agent)}:${item}`).join('\n') : null
}