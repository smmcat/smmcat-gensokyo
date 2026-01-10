import { Session } from "koishi"
import { DatabaseUserAttribute, User } from "../users"
import { BattleAttribute, BattleData } from "../battle"

export enum PropType {
    消耗类 = '消耗类',
    礼包类 = '礼包类',
    任务道具 = '任务道具',
    技能书 = '技能书'
}

export type propsTemplateData = {
    [keys: string]: {
        name: string,
        type: PropType,
        info: string,
        price: number,
        cooling?: number,
        fn: (session: Session) => Promise<void | { err: boolean }>
    }
}
export const propsData: propsTemplateData = {
    "红药": {
        name: "红药",
        type: PropType.消耗类,
        info: '回复自身20HP',
        price: 10,
        fn: async function (session) {
            const result = { err: false }
            await User.giveHPMP(session.userId, { hp: 20 }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    result.err = true
                    return
                }
                const msg = `回复成功，玩家当前血量：${val.currentHP}`
                await session.send(msg)
            })
            return result
        }
    },
    "大红药": {
        name: "大红药",
        type: PropType.消耗类,
        info: '回复自身(120HP+5%最高血量上限)HP',
        price: 10,
        fn: async function (session) {
            const result = { err: false }
            const { maxHp } = User.getUserAttributeByUserId(session.userId)
            await User.giveHPMP(session.userId, { hp: Math.floor(120 + maxHp * 0.05) }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    result.err = true
                    return
                }
                const msg = `回复成功，玩家当前血量：${val.currentHP}`
                await session.send(msg)
            })
            return result
        }
    },
    "蓝药": {
        name: "蓝药",
        type: PropType.消耗类,
        info: '回复自身20MP',
        price: 10,
        fn: async function (session) {
            const result = { err: false }
            await User.giveHPMP(session.userId, { mp: 20 }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    result.err = true
                    return
                }
                const msg = `回复成功，玩家当前蓝量：${val.currentMP}`
                await session.send(msg)
            })
            return result
        }
    },
    "初级万能药": {
        name: "初级万能药",
        type: PropType.消耗类,
        info: '回复自身20MP和20HP',
        price: 20,
        fn: async function (session) {
            const result = { err: false }
            await User.giveHPMP(session.userId, { hp: 20, mp: 20 }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    result.err = true
                    return
                }
                const msg = `回复成功，玩家当前血量：${val.currentHP}、蓝量：${val.currentMP}`
                await session.send(msg)
            })
            return result
        }
    },
    "初级复活卷轴": {
        name: "初级复活卷轴",
        type: PropType.消耗类,
        info: '复活玩家，复活时保留 20% 血量。(该道具使用完需要冷却 6 分钟)',
        price: 10,
        cooling: 3600,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            if (!User.isDie(session.userId)) {
                session.send(`您还没有阵亡，使用失败！`)
                return { err: true }
            }
            const { maxHp } = User.getUserAttributeByUserId(session.userId)
            User.giveLife(session.userId, Math.floor(maxHp * 0.2), async (val) => {
                await session.send(`复活成功，当前血量：${val.currentHP}`)
            })
        }
    },
    "中级复活卷轴": {
        name: "中级复活卷轴",
        type: PropType.消耗类,
        info: '复活玩家，复活时保留 80% 血量。(该道具使用完需要冷却 6 分钟)',
        price: 120,
        cooling: 3600,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            if (!User.isDie(session.userId)) {
                session.send(`您还没有阵亡，使用失败！`)
                return { err: true }
            }
            const { maxHp } = User.getUserAttributeByUserId(session.userId)
            User.giveLife(session.userId, Math.floor(maxHp * 0.8), async (val) => {
                await session.send(`复活成功，当前血量：${val.currentHP}`)
            })
        }
    },
    "技能书-毒之牙": {
        name: "技能书-毒之牙",
        type: PropType.技能书,
        info: '通过该道具可直接学习主动技能【毒之牙】供战斗使用。',
        price: 1500,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            return await User.giveSkill(session.userId, { name: '毒之牙', type: '主动' }, async (val) => {
                await session.send(val.msg)
            })
        }
    },
    "技能书-恐怖催眠术": {
        name: "技能书-恐怖催眠术",
        type: PropType.技能书,
        info: '通过该道具可直接学习主动技能【恐怖催眠术】供战斗使用。',
        price: 1500,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            return await User.giveSkill(session.userId, { name: '恐怖催眠术', type: '主动' }, async (val) => {
                await session.send(val.msg)
            })
        }
    },
    "技能书-初级驱散": {
        name: "技能书-初级驱散",
        type: PropType.技能书,
        info: '通过该道具可直接学习主动技能【初级驱散】供战斗使用。',
        price: 1500,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            return await User.giveSkill(session.userId, { name: '初级驱散', type: '主动' }, async (val) => {
                await session.send(val.msg)
            })
        }
    },
    "技能书-治愈之光": {
        name: "技能书-治愈之光",
        type: PropType.技能书,
        info: '通过该道具可直接学习主动技能【治愈之光】供战斗使用。',
        price: 1500,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            return await User.giveSkill(session.userId, { name: '治愈之光', type: '主动' }, async (val) => {
                await session.send(val.msg)
            })
        }
    },
    "技能书-飞雪": {
        name: "技能书-飞雪",
        type: PropType.技能书,
        info: '通过该道具可直接学习主动技能【飞雪】供战斗使用。',
        price: 1500,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            return await User.giveSkill(session.userId, { name: '飞雪', type: '主动' }, async (val) => {
                await session.send(val.msg)
            })
        }
    },
    "技能书-霜月架势": {
        name: "技能书-霜月架势",
        type: PropType.技能书,
        info: '通过该道具可直接学习主动技能【霜月架势】供战斗使用。',
        price: 1500,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            return await User.giveSkill(session.userId, { name: '霜月架势', type: '主动' }, async (val) => {
                await session.send(val.msg)
            })
        }
    },
    "被动书-针女": {
        name: "被动书-针女",
        type: PropType.技能书,
        info: '通过该道具可直接学习被动技能【针女】供战斗使用。',
        price: 1500,
        fn: async function (session) {
            if (BattleData.isBattleByUserId(session.userId)) {
                session.send(`该道具在战斗中无法使用！请在小队脱离战斗后使用。`)
                return { err: true }
            }
            return await User.giveSkill(session.userId, { name: '针女', type: '被动' }, async (val) => {
                await session.send(val.msg)
            })
        }
    },
}