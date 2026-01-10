import { Context, Session } from "koishi"
import { Config } from "."
import { User } from "./users"
import { skillFn, UserOccupation } from "./data/skillFn"
import { PassiveFn } from "./data/PassiveFn"
import { BattleData } from "./battle"


export type UserActiveSkillItem = {
    proficient: number
}

export type fastSkill = string | null | undefined

/** 数据库存放的数据 */
export type UserDatabaseSkill = {
    userId?: string,
    /** 快捷技能 */
    fast_activeSkill: { 1: fastSkill, 2: fastSkill, 3: fastSkill, 4: fastSkill },
    usePassiveSkill: string[],
    /** 主动技能 */
    activeSkill: { [keys: string]: UserActiveSkillItem },
    /** 被动技能 */
    passiveSkill: string[]
}

declare module 'koishi' {
    interface Tables {
        smm_gensokyo_user_skill: UserDatabaseSkill
    }
}

export const UserSkill = {
    config: {} as Config,
    ctx: {} as Context,
    userSkillTemp: {} as { [keys: string]: UserDatabaseSkill },
    async init(config: Config, ctx: Context) {
        UserSkill.config = config;
        UserSkill.ctx = ctx;

        ctx.database.extend('smm_gensokyo_user_skill', {
            userId: 'string',
            fast_activeSkill: 'json',
            usePassiveSkill: 'json',
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
            temp[item.userId] = item
            delete item.userId
        })
        UserSkill.userSkillTemp = temp
    },
    /** 获取当前携带技能信息 */
    getUserSkillData(userId: string) {
        UserSkill.initUserSkill(userId)
        const userSkillData = UserSkill.userSkillTemp[userId]
        const currentActiveSkill = Object.values(userSkillData.fast_activeSkill).filter((i) => i).map((item) => {
            return { name: item, prob: skillFn[item].useTime }
        })
        const currentPassiveSkill = userSkillData.usePassiveSkill
        return {
            activeSkill: currentActiveSkill,
            passiveSkill: currentPassiveSkill
        }
    },
    /** 调整/添加 快捷主动技能 */
    async adjustActiveSkill(session: Session, skillName: string, index?: number) {
        const { userId } = session;
        UserSkill.initUserSkill(userId)

        if (BattleData.isBattleByUserId(session.userId)) {
            await session.send(User.getUserName(userId) + `：战斗状态下无法配置技能。`)
            return
        }
        const userSkillData = UserSkill.userSkillTemp[userId]
        const activeSkill = Object.keys(userSkillData.activeSkill)
        if (!activeSkill.includes(skillName)) {
            await session.send(User.getUserName(userId) + `：您并未拥有【${skillName}】主动技能！`)
            return
        }
        if (index == undefined) {
            const nullIndex = Object.keys(userSkillData.fast_activeSkill).find((item) => {
                return !userSkillData.fast_activeSkill[item]
            }) || 1
            userSkillData.fast_activeSkill[nullIndex] = skillName
            await session.send(User.getUserName(userId) + `：已将【${skillName}】设置为快捷技能槽：${nullIndex}。\n` +
                `您可以使用 /打怪技能 ${nullIndex} 去释放该技能。`)
        } else {
            if (index > 4 || index <= 0) {
                await session.send(User.getUserName(userId) + `：设置快捷技能失败，主动技能快捷槽只有 1~4，请重新设置。`)
                return
            }
            userSkillData.fast_activeSkill[index] = skillName
            await session.send(User.getUserName(userId) + `：已将【${skillName}】设置为快捷技能槽：${index}。\n` +
                `您也可以使用 /打怪技能 ${index} 去释放该技能。`)
        }
        await UserSkill.setLocalUserData(userId)
    },
    /** 初始化技能数据 */
    async initUserSkill(userId: string) {
        if (!UserSkill.userSkillTemp[userId]) {
            let initActiveSkill = []
            let initPassiveSkill = []
            if (User.userTempData[userId].type == UserOccupation.剑士) {
                initActiveSkill = ['重砍']
            } else if (User.userTempData[userId].type == UserOccupation.法师) {
                initActiveSkill = ['水炮']
            } else if (User.userTempData[userId].type == UserOccupation.刺客) {
                initActiveSkill = ['突刺']
            }

            // 初始化技能树
            const dictActiveSkill = {} as { [keys: string]: UserActiveSkillItem }
            initActiveSkill.forEach((skill) => {
                dictActiveSkill[skill] = {
                    proficient: 0
                }
            })

            UserSkill.userSkillTemp[userId] = {
                userId,
                fast_activeSkill: { 1: null, 2: null, 3: null, 4: null },
                usePassiveSkill: [],
                activeSkill: dictActiveSkill,
                passiveSkill: initPassiveSkill
            }
            await UserSkill.ctx.database.create('smm_gensokyo_user_skill', UserSkill.userSkillTemp[userId])
        }
    },
    /** 技能数据存储到本地 */
    async setLocalUserData(userId: string) {
        const temp = UserSkill.userSkillTemp[userId]
        await UserSkill.ctx.database.set('smm_gensokyo_user_skill', { userId }, temp)
    },
    /** 添加技能书 */
    async addSkill(userId: string, skill: { name: string, type: '主动' | '被动' }) {
        UserSkill.initUserSkill(userId)
        const userSkillData = UserSkill.userSkillTemp[userId]
        const { lv } = User.userTempData[userId]

        if (skill.type == '主动') {
            if (userSkillData.activeSkill[skill.name]) {
                return { code: false, msg: `添加失败，【${skill.name}】该技能已经学会！无需再次添加。` }
            }
            if (!skillFn[skill.name]) {
                return { code: false, msg: `添加失败，信息库中未找到【${skill.name}】主动技能` }
            }
            if (skillFn[skill.name].lv > lv) {
                return { code: false, msg: `添加失败，等级不满足学习【${skill.name}】主动技能` }
            }
            // 创建新的数据
            userSkillData.activeSkill[skill.name] = {
                proficient: 0
            }
        } else if (skill.type == '被动') {
            if (userSkillData.passiveSkill.includes(skill.name)) {
                return { code: false, msg: `添加失败，【${skill.name}】该被动已经学会！无需再次添加。` }
            }
            if (!PassiveFn[skill.name]) {
                return { code: false, msg: `添加失败，信息库中未找到【${skill.name}】被动技能` }
            }
            if (PassiveFn[skill.name].lv > lv) {
                return { code: false, msg: `添加失败，等级不满足学习【${skill.name}】被动技能` }
            }
            userSkillData.passiveSkill.push(skill.name)
        }
        await UserSkill.setLocalUserData(userId)
        return { code: true, msg: `已成功学习【${skill.name}】${skill.type}技能。` }
    },
    /** 获取用户技能数据 文本输出 */
    getUserBattleSkillTextData(userId: string) {
        UserSkill.initUserSkill(userId)
        const userSkillData = UserSkill.userSkillTemp[userId]
        const currentActiveSkill = Object.values(userSkillData.fast_activeSkill).filter((i) => i)
        const currentPassiveSkill = userSkillData.usePassiveSkill
        console.log(userSkillData);


        return User.getUserName(userId) + `技能信息如下：\n` +
            `[装配中-主动技能]\n` +
            Object.keys(userSkillData.fast_activeSkill).map((item) => {
                if (!userSkillData.fast_activeSkill[item]) {
                    return `技能槽${item}：无配置`
                }
                const select_skillName = userSkillData.fast_activeSkill[item]
                return `技能槽${item}：${userSkillData.fast_activeSkill[item]} (熟练度：${userSkillData.activeSkill[select_skillName].proficient})`
            }).join('\n') + '\n\n' +
            `[装配中-被动技能]\n` +
            (currentPassiveSkill.join('\n') || '无配置') + '\n\n' +
            `[未装配技能]\n` +
            (Object.keys(userSkillData.activeSkill).filter((i) => {
                return !currentActiveSkill.includes(i)
            }).map(i => `${i} (主动)`).join('\n') || '无任何未装配主动技能') + '\n' +
            (userSkillData.passiveSkill.filter((i) => {
                return !currentActiveSkill.includes(i)
            }).map(i => `${i} (被动)`).join('\n') || '无任何未装配被动技能')
    }
}