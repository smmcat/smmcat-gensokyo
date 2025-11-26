import { Context } from "koishi"
import { Config } from "."

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
    /** 更新本地数据库对应数据 */
    async setDatabasePropsData(userId: string) {
        const propsData = Props.userPorpsTemp[userId]
        if (propsData) {
            const temp = {
                props: propsData
            } as UserDatabaseProps
            await Props.ctx.database.set('smm_gensokyo_user_props', { userId }, temp)
        }
    }
}