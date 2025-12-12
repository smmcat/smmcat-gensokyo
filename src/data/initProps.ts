import { Session } from "koishi"
import { DatabaseUserAttribute, User } from "../users"
import { BattleAttribute, BattleData } from "../battle"

export enum PropType {
    消耗类 = '消耗类',
    礼包类 = '礼包类',
    任务道具 = '任务道具'
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
            User.giveHPMP(session.userId, { hp: 20 }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    return
                }
                const msg = `回复成功，玩家当前血量：${val.currentHP}`
                await session.send(msg)
            })
        }
    },
    "大红药": {
        name: "大红药",
        type: PropType.消耗类,
        info: '回复自身(120HP+5%最高血量上限)HP',
        price: 10,
        fn: async function (session) {
            const { maxHp } = User.getUserAttributeByUserId(session.userId)
            User.giveHPMP(session.userId, { hp: Math.floor(120 + maxHp * 0.05) }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    return
                }
                const msg = `回复成功，玩家当前血量：${val.currentHP}`
                await session.send(msg)
            })
        }
    },
    "蓝药": {
        name: "蓝药",
        type: PropType.消耗类,
        info: '回复自身20MP',
        price: 10,
        fn: async function (session) {
            User.giveHPMP(session.userId, { mp: 20 }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    return
                }
                const msg = `回复成功，玩家当前蓝量：${val.currentMP}`
                await session.send(msg)
            })
        }
    },
    "初级万能药": {
        name: "初级万能药",
        type: PropType.消耗类,
        info: '回复自身20MP和20HP',
        price: 20,
        fn: async function (session) {
            User.giveHPMP(session.userId, { hp: 20, mp: 20 }, async (val) => {
                if (val.err) {
                    await session.send(val.err)
                    return
                }
                const msg = `回复成功，玩家当前血量：${val.currentHP}、蓝量：${val.currentMP}`
                await session.send(msg)
            })
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
    }
}