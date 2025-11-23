import { Context, Session } from "koishi";
import { Config } from ".";


declare module 'koishi' {
    interface Tables {
        smm_gensokyo_user_attribute: DatabaseUserAttribute
    }
}

export enum UserOccupation {
    剑士 = "剑士",
    法师 = "法师",
    刺客 = "刺客"
}

/** 角色基础属性 */
export type UserBaseAttribute = {
    /** 凭据ID */
    userId: string,
    /** 游戏昵称 */
    playName: string,
    /** 职位 */
    type: UserOccupation,
    /** 经验 */
    exp: number,
    /** 最大经验 */
    maxExp: number,
    /** 等级 */
    lv: number,
    /** 血量 */
    hp: number,
    /** 最大血量 */
    maxHp: number,
    /** 蓝量 */
    mp: number,
    /** 最大蓝量 */
    maxMp: number,
    /** 活力 */
    pp: number,
    /** 最大活力 */
    maxPp: number,
    /** 攻击力 */
    atk: number,
    /** 防御力 */
    def: number,
    /** 暴击率 */
    chr: number,
    /** 暴击伤害 */
    ghd: number,
    /** 闪避值 */
    evasion: number,
    /** 命中值 */
    hit: number,
    /** 出手速度 */
    speed: number
}

export type UserBenchmark = {
    [keys: number]: {
        /** 最大经验 */
        maxExp: number,
        /** 最大血量 */
        maxHp: number,
        /** 最大蓝量 */
        maxMp: number,
        /** 攻击力 */
        atk: number,
        /** 防御力 */
        def: number,
        /** 暴击率 */
        chr: number,
        /** 暴击伤害 */
        ghd: number,
        /** 闪避值 */
        evasion: number,
        /** 命中值 */
        hit: number,
        /** 出手速度 */
        speed: number
    }
}

export type DatabaseUserAttribute = {
    /** 凭据ID */
    userId: string,
    /** 游戏昵称 */
    playName: string,
    /** 职位 */
    type: UserOccupation,
    /** 经验 */
    exp: number,
    /** 等级 */
    lv: number,
    /** 血量 */
    hp: number,
    /** 蓝量 */
    mp: number,
    /** 活力 */
    pp: number,
}

type UserTempData = {
    [keys: string]: DatabaseUserAttribute
}
export const UserOccDict: Record<UserOccupation, { info: string, initStatus: UserBaseAttribute }> = {
    [UserOccupation.剑士]: {
        info: "擅长近战攻击，拥有强大的属性能力",
        initStatus: {
            userId: "",
            playName: "",
            type: UserOccupation.剑士,
            exp: 0,
            maxExp: 100,
            lv: 1,
            hp: 120,
            maxHp: 120,
            mp: 80,
            maxMp: 80,
            pp: 100,
            maxPp: 100,
            atk: 12,
            def: 5,
            chr: 50,
            ghd: 1.2,
            speed: 5,
            evasion: 100,
            hit: 1000
        }
    },
    [UserOccupation.法师]: {
        info: "精通元素魔法，能够打出爆发伤害",
        initStatus: {
            userId: "",
            playName: "",
            type: UserOccupation.法师,
            exp: 0,
            maxExp: 100,
            lv: 1,
            hp: 100,
            maxHp: 100,
            mp: 100,
            maxMp: 100,
            pp: 100,
            maxPp: 100,
            atk: 10,
            def: 2,
            chr: 50,
            ghd: 1.2,
            speed: 5,
            evasion: 100,
            hit: 1000
        }
    },
    [UserOccupation.刺客]: {
        info: "迅捷攻击，高闪避值的高敏玩家",
        initStatus: {
            userId: "",
            playName: "",
            type: UserOccupation.刺客,
            exp: 0,
            maxExp: 100,
            lv: 1,
            hp: 90,
            maxHp: 90,
            mp: 70,
            maxMp: 70,
            pp: 100,
            maxPp: 100,
            atk: 8,
            def: 2,
            chr: 80,
            ghd: 1.3,
            speed: 6,
            evasion: 120,
            hit: 1000
        }
    }
};

export const User = {
    config: {} as Config,
    ctx: {} as Context,
    userTempData: {} as UserTempData,
    async init(config: Config, ctx: Context) {
        User.config = config;
        User.ctx = ctx;
        // 创建数据库表结构
        ctx.model.extend(
            'smm_gensokyo_user_attribute',
            {
                userId: 'string',
                playName: 'string',
                type: 'string',
                exp: 'integer',
                lv: 'integer',
                hp: 'integer',
                mp: 'integer',
                pp: 'integer'
            },
            {
                primary: 'userId',
                autoInc: false
            }
        )
        // 预缓存
        const userData = await ctx.database.get('smm_gensokyo_user_attribute', {})
        const temp = {} as UserTempData
        userData.forEach((item) => {
            temp[item.userId] = item
        })
        User.userTempData = temp
    },
    /** 获取角色基础属性 */
    async getUserAttribute(session: Session) {
        if (!User.userTempData[session.userId]) {
            await session.send('未创建账户，请发送 /开始注册 完成账号的注册！')
            return null
        }
        return User.getUserAddLvAttribute(session.userId)
    },
    /** 获取角色实际等级属性数据 */
    getUserAddLvAttribute(userId: string) {
        const UserDict = User.userTempData[userId]
        if (!UserDict) return null

        // 赋予当前职业模板属性
        const UserData = {
            ...UserOccDict[UserDict.type].initStatus,
            lv: UserDict.lv,
            hp: UserDict.hp,
            exp: UserDict.exp,
            pp: UserDict.pp,
            playName: UserDict.playName,
            userId: UserDict.userId
        } as UserBaseAttribute

        const lv = UserData.lv
        const benchmark = {
            10: {
                maxExp: 2,
                maxHp: 1.2,
                maxMp: 1.1,
                atk: 1.12,
                def: 1.1,
                chr: 1.1,
                evasion: 1.1,
                hit: 1.1,
                ghd: 1.0,
                speed: 1.05
            },
            20: {
                maxExp: 1.8,
                maxHp: 1.15,
                maxMp: 1.1,
                atk: 1.1,
                def: 1.1,
                chr: 1.1,
                evasion: 1.1,
                hit: 1.08,
                ghd: 1.0,
                speed: 1.05
            },
            40: {
                maxExp: 1.5,
                maxHp: 1.1,
                maxMp: 1.05,
                atk: 1.1,
                def: 1.05,
                chr: 1.05,
                evasion: 1.05,
                hit: 1.05,
                ghd: 1.05,
                speed: 1.05
            }
        } as UserBenchmark
        const temp = {} as UserBaseAttribute

        // 选择等级配置
        const lvScope = Object.keys(benchmark).reverse().find((item) => Number(item) < lv) || 10
        const useBenchmark = benchmark[lvScope]

        // 赋予等级叠加后的属性
        Object.keys(UserData).forEach((i) => {
            temp[i] = UserData[i]
            if (useBenchmark[i]) {
                if (i == 'maxExp') {
                    temp[i] = Math.floor(100 * useBenchmark[i] * (lv - 1)) || 100
                } else {
                    temp[i] += Math.floor((temp[i] * (useBenchmark[i] - 1) * (lv - 1)))
                }
            }
        })
        return temp
    },
    /** 通过 userId 获取角色属性 */
    getUserAttributeByUserId(userId: string) {
        return User.getUserAddLvAttribute(userId) || null
    },
    /** 创建游戏账号 */
    async createPlayUser(session: Session) {

        const [data] = await User.ctx.database.get('smm_gensokyo_user_attribute', { userId: session.userId })
        if (data) {
            await session.send('已存在账号，请勿重复创建！')
            return
        }
        await session.send('请输入自己的游戏昵称：(60s)')
        const playname = await session.prompt(60000)
        if (playname == undefined) return

        const [repeat] = await User.ctx.database.get('smm_gensokyo_user_attribute', { playName: playname.trim() })
        if (repeat) {
            await session.send('名字重复，请更换一个名字。')
            return
        }
        if (playname.trim().length > 6 || playname.trim().length < 1) {
            await session.send('名字长度有问题，要求小于 6个字，大于 1个字')
            return
        }

        await session.send(`请输入要专职的职业：（60s）\n${Object.keys(UserOccDict).map((i) =>
            `【${i}】:${UserOccDict[i].info}`).join('\n')}`)

        let jobType = await session.prompt(60000)
        if (jobType == undefined) return
        while (!Object.keys(UserOccDict).includes(jobType)) {
            await session.send('未找到该职业，请重新选择！')
            jobType = await session.prompt(60000)
        }

        // 写入数据库数据
        const temp = {
            userId: session.userId,
            playName: playname.trim(),
            type: jobType,
            hp: UserOccDict[jobType].initStatus.hp,
            pp: UserOccDict[jobType].initStatus.pp,
            mp: UserOccDict[jobType].initStatus.mp,
            lv: 1,
            exp: 0
        } as DatabaseUserAttribute
        User.ctx.database.create('smm_gensokyo_user_attribute', temp)
        User.userTempData[session.userId] = temp as DatabaseUserAttribute
        await session.send('创建成功！\n' + User.userAttributeTextFormat(session.userId))
    },
    /** 信息格式化 */
    userAttributeTextFormat(userId: string) {
        if (!User.userTempData[userId]) {
            return '没有找到您的角色信息'
        }
        const temp = User.getUserAttributeByUserId(userId) as UserBaseAttribute
        return `昵称：${temp.playName}\n` +
            `职位：${temp.type}\n` +
            `等级：${temp.lv} (${temp.exp}/${temp.maxExp})\n` +
            `-----------------\n` +
            `【生命值】${temp.hp}/${temp.maxHp}\n` +
            `【魔法值】${temp.mp}/${temp.maxMp}\n` +
            `【活力值】${temp.pp}/${temp.maxPp}\n` +
            `-----------------\n` +
            `【攻击力】${temp.atk} (+0)\n` +
            `【防御力】${temp.def} (+0)\n` +
            `【命中值】${temp.hit} (+0)\n` +
            `【速度值】${temp.speed} (+0)\n` +
            `【闪避值】${temp.evasion} (+0)\n` +
            `【暴击率】${(temp.chr / 10).toFixed(1)}% (+0%)\n` +
            `【暴击伤害】${(temp.ghd * 100).toFixed(1)}% (+0%)`
    }
}