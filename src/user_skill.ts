import { Context, Session } from "koishi"
import { Config } from "."


export type UserActiveSkillItem = {
    name: string,
    useTime: number,
    proficient: number
}

export type UserPassiveSkillItem = {
    name: string
}

/** 数据库存放的数据 */
export type UserDatabaseSkill = {
    userId?: string,
    /** 快捷技能 */
    fastUse: { name: string, type: '主动' | '被动' }[],
    /** 主动技能 */
    activeSkill: { [keys: string]: UserActiveSkillItem },
    /** 被动技能 */
    passiveSkill: { [keys: string]: UserPassiveSkillItem }
}

declare module 'koishi' {
    interface Tables {
        smm_gensokyo_user_skill: UserDatabaseSkill
    }
}

export const userSkill = {
    config: {} as Config,
    ctx: {} as Context,
    userSkillTemp: {} as {},
    async init(config: Config, ctx: Context) {
        userSkill.config = config;
        userSkill.ctx = ctx;

        ctx.database.extend('smm_gensokyo_user_skill', {
            userId: 'string',
            fastUse: 'json',
            activeSkill: 'json',
            passiveSkill: 'json'
        }, {
            primary: 'userId',
            autoInc: false
        })

        // 同步数据库数据
        const temp = {}
        const propsList = await ctx.database.get('smm_gensokyo_user_skill', {})
        propsList.forEach((item) => {
            temp[item.userId] = {}
        })
        userSkill.userSkillTemp = temp
    },
}