import { Context, Session } from "koishi"
import { Config, name } from "."
import { propsData } from "./data/initProps"
import { User } from "./users"

/** 道具信息 */
export type UserPropItem = {
    name: string,
    type: string,
    value: number
}

export type UserPropsList = {
    [keys: string]: UserPropItem
}

export type UserPrposTemp = {
    [keys: string]: UserPropsList
}

/** 数据库存放的数据 */
export type UserDatabaseProps = {
    userId?: string,
    props: UserPropsList
}
declare module 'koishi' {
    interface Tables {
        smm_gensokyo_user_props: UserDatabaseProps
    }
}

export const Props = {
    config: {} as Config,
    ctx: {} as Context,
    userPorpsTemp: {} as UserPrposTemp,
    async init(config: Config, ctx: Context) {
        Props.config = config;
        Props.ctx = ctx;

        ctx.database.extend('smm_gensokyo_user_props', {
            userId: 'string',
            props: 'json'
        }, {
            primary: 'userId',
            autoInc: false
        })

        // 同步数据库数据
        const temp = {}
        const propsList = await ctx.database.get('smm_gensokyo_user_props', {})
        propsList.forEach((item) => {
            temp[item.userId] = item.props
        })
        Props.userPorpsTemp = temp
    },
    /** 创建本地数据 */
    async initUserPropsData(userId: string) {
        if (!Props.userPorpsTemp[userId]) {
            Props.userPorpsTemp[userId] = {}
            const temp = {
                userId,
                props: {}
            } as UserDatabaseProps
            await Props.ctx.database.create('smm_gensokyo_user_props', temp)
        }
    },
    /** 获取持有道具信息 */
    async getPropsDataByUserId(userId: string) {
        await Props.initUserPropsData(userId)
        const userProps = Props.userPorpsTemp[userId]
        const msgList = Object.keys(userProps).map((item) => {
            return `${userProps[item].name}:${userProps[item].value}个`
        })
        return msgList.length ? `当前您持有如下道具：\n\n` + msgList.join('\n') : '您没有任何道具...'
    },
    /** 更新本地数据库对应数据 */
    async setDatabasePropsData(userId: string) {
        const propsData = Props.userPorpsTemp[userId]
        if (propsData) {
            const temp = {
                props: propsData
            } as UserDatabaseProps
            await Props.ctx.database.set('smm_gensokyo_user_props', { userId }, temp)
        }
    },
    /** 使用指定道具 */
    async userProps(session: Session, propsName: string) {
        const userId = session.userId
        const userPropsData = Props.userPorpsTemp[userId]
        if (!userPropsData) return
        if (!userPropsData[propsName]) {
            await session.send(`您似乎没有${propsName}这个道具...`)
            return
        }

        // 如果存在冷却时间
        if (propsData[propsName].cooling) {
            if (!coolingTemp[userId]) coolingTemp[userId] = {}
            if (!coolingTemp[userId][propsName]) coolingTemp[userId][propsName] = 0

            const gapTime = Date.now() - coolingTemp[userId][propsName]
            if (gapTime < propsData[propsName].cooling) {
                await session.send(`该道具冷却还未结束，请等待${Math.ceil((coolingTemp[userId][propsName] - gapTime) / 60)}秒！`)
                return
            } else {
                coolingTemp[userId][propsName] = Date.now()
            }
        }

        User.loseProps(userId, { name: propsName, val: 1 }, async (val) => {
            if (val.err) {
                await session.send(val.err)
                return
            }
            if (propsData[propsName].cooling) {
                coolingTemp[userId]
            }
            const result = await propsData[propsName].fn(session)
            // 若存在问题返还道具
            if (result && typeof result === 'object' && 'err' in result) {
                if (result.err) {
                    await User.giveProps(userId, [{ name: propsName, val: 1 }]);
                }
            }
        })
    }
}

const coolingTemp = {}