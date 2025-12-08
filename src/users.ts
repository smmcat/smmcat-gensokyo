import { Context, Session } from "koishi";
import { Config } from ".";
import { userBenchmark } from "./data/benchmark";
import { Props } from "./props";
import { propsData } from "./data/initProps";
import { BattleData } from "./battle";
import { UserOccupation } from "./data/skillFn";
import { monsterData } from "./data/initMonster";


declare module 'koishi' {
    interface Tables {
        smm_gensokyo_user_attribute: DatabaseUserAttribute
    }
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
    /** 暴击抵抗 */
    csr: number,
    /** 闪避值 */
    evasion: number,
    /** 命中值 */
    hit: number,
    /** 出手速度 */
    speed: number
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
    /** 是否死亡 */
    isDie: boolean
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
            csr: 0,
            ghd: 1.2,
            speed: 5,
            evasion: 100,
            hit: 100
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
            csr: 0,
            ghd: 1.2,
            speed: 5,
            evasion: 100,
            hit: 100
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
            csr: 0,
            ghd: 1.3,
            speed: 6,
            evasion: 120,
            hit: 100
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
                pp: 'integer',
                isDie: 'boolean'
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
    /** 获取玩家名字 */
    getUserName(userId: string) {
        return User.userTempData[userId].playName || null
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
            mp: UserDict.mp,
            exp: UserDict.exp,
            pp: UserDict.pp,
            playName: UserDict.playName,
            userId: UserDict.userId
        } as UserBaseAttribute

        const lv = UserData.lv
        const temp = {} as UserBaseAttribute
        // 选择等级配置
        const lvScope = Object.keys(userBenchmark).reverse().find((item) => Number(item) < lv) || 10
        const useBenchmark = userBenchmark[lvScope]

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
        if (Object.keys(monsterData).includes(playname?.trim())) {
            await session.send('请不要设置怪物的名字！')
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
            exp: 0,
            isDie: false
        } as DatabaseUserAttribute
        User.ctx.database.create('smm_gensokyo_user_attribute', temp)
        User.userTempData[session.userId] = temp as DatabaseUserAttribute
        await Props.initUserPropsData(session.userId) // 道具信息写入
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
            `【速度值】${temp.speed} (+0)\n` +
            `【闪避值】${temp.evasion} (+0)\n` +
            `【命中率】${(temp.hit / 10 + 100).toFixed(1)}% (+0%)\n` +
            `【暴击率】${(temp.chr / 10).toFixed(1)}% (+0%)\n` +
            `【暴击伤害】${(temp.ghd * 100).toFixed(1)}% (+0%)` +
            (temp.csr > 0 ? `\n【暴击抵抗】${temp.csr}` : '')
    },
    /** 写入用户数据到数据库 */
    async setDatabaseUserAttribute(userId: string) {
        const userInfo = User.userTempData[userId]
        if (!userInfo) return
        // 写入数据库数据
        const temp = {
            playName: userInfo.playName.trim(),
            hp: userInfo.hp,
            pp: userInfo.pp,
            mp: userInfo.mp,
            lv: userInfo.lv,
            exp: userInfo.exp
        } as DatabaseUserAttribute
        User.ctx.database.set('smm_gensokyo_user_attribute', { userId }, temp)
    },
    /** 给予玩家经验 */
    async giveExp(userId: string, value: number, fn?: (upData: {
        maxHp: number;
        maxMp: number;
        atk: number;
        def: number;
        lv: number;
        name: string
    }) => Promise<void>) {
        const userInfo = User.userTempData[userId]
        if (!userInfo) return

        const beforData = { ...User.getUserAttributeByUserId(userId) }
        let isUp = false
        userInfo.exp += value
        while (true) {
            const { maxExp } = User.getUserAttributeByUserId(userId)
            if (userInfo.exp < maxExp) break
            userInfo.lv += 1
            userInfo.exp -= maxExp
            isUp = true
        }

        if (isUp) {
            const afterData = User.getUserAttributeByUserId(userId)
            const upTemp = {
                name: afterData.playName,
                lv: afterData.lv,
                maxHp: afterData.maxHp - beforData.maxHp,
                maxMp: afterData.maxMp - beforData.maxMp,
                atk: afterData.atk - beforData.atk,
                def: afterData.def - beforData.def
            }
            fn && await fn(upTemp)
        }
        await User.setDatabaseUserAttribute(userId)
    },
    /** 给予玩家死亡 */
    async giveDie(userId: string) {
        const userInfo = User.userTempData[userId]
        userInfo.hp = 0;
        userInfo.isDie = true;
        await User.setDatabaseUserAttribute(userId)
    },
    /** 给予玩家复活 */
    async giveLife(userId: string, val?: number, fn?: (updata: { currentHP: number }) => Promise<void>) {
        const userInfo = User.userTempData[userId]
        if (!val) {
            const { maxHp } = User.getUserAttributeByUserId(userId)
            userInfo.hp = maxHp
        } else {
            userInfo.hp = val
        }
        await User.setDatabaseUserAttribute(userId)
        fn && await fn({ currentHP: userInfo.hp })
    },
    /** 给予玩家血量或者蓝量 */
    async giveHPMP(userId: string, value: { hp?: number, mp?: number }, fn?: (upData: {
        currentHP: number,
        currentMP: number,
        err?: string
    }) => Promise<void>) {
        const userInfo = User.userTempData[userId]
        if (!userInfo) return
        if (userInfo.isDie) {
            fn && await fn({
                currentHP: 0,
                currentMP: 0,
                err: '角色已死亡，无法使用恢复道具。'
            })
            return
        }

        // 如果玩家是在战斗中使用 优先补给战斗状态
        if (BattleData.isBattleByUserId(userId)) {
            const { goal, self } = BattleData.lastPlay[userId]
            const agentAll = [...goal, ...self]
            const agent = agentAll.find(item => item?.userId == userId)
            if (!agent) return
            if (agent.hp + (value.hp || 0) < agent.maxHp) {
                agent.hp += value.hp || 0
            } else {
                agent.hp = agent.maxHp
            }
            if (agent.mp + (value.mp || 0) < agent.maxMp) {
                agent.mp += value.mp || 0
            } else {
                agent.mp = agent.maxMp
            }
            fn && await fn({
                currentHP: agent.hp,
                currentMP: agent.mp
            })
            return
        }

        const { maxHp, maxMp } = User.getUserAttributeByUserId(userId)
        if (value.hp && !value.mp && userInfo.hp == maxHp) {
            fn && await fn({
                currentHP: userInfo.hp,
                currentMP: userInfo.mp,
                err: '当前血量已满，无需回复。'
            })
            return
        }
        if (value.mp && !value.hp && userInfo.mp == maxMp) {
            fn && await fn({
                currentHP: userInfo.hp,
                currentMP: userInfo.mp,
                err: '当前蓝量已满，无需回复。'
            })
            return
        }
        if (value.mp && value.hp && userInfo.mp == maxMp && userInfo.hp == maxHp) {
            fn && await fn({
                currentHP: userInfo.hp,
                currentMP: userInfo.mp,
                err: '当前状态全满，无需回复。'
            })
            return
        }
        if (userInfo.hp + (value.hp || 0) < maxHp) {
            userInfo.hp += value.hp || 0
        } else {
            userInfo.hp = maxHp
        }
        if (userInfo.mp + (value.mp || 0) < maxHp) {
            userInfo.mp += value.mp || 0
        } else {
            userInfo.mp = maxMp
        }
        fn && await fn({
            currentHP: userInfo.hp,
            currentMP: userInfo.mp
        })
        await User.setDatabaseUserAttribute(userId)
    },
    /** 给予玩家PP值 */
    async givePP(userId: string, value: number, fn?: (upData: {
        currentPP: number
    }) => Promise<void>) {
        const userInfo = User.userTempData[userId]
        if (!userInfo) return
        const { maxPp } = User.getUserAttributeByUserId(userId)
        if (userInfo.pp + value < maxPp) {
            userInfo.pp += value
        } else {
            userInfo.pp = maxPp
        }
        fn && await fn({
            currentPP: userInfo.pp
        })
        await User.setDatabaseUserAttribute(userId)
    },
    async lostPP(userId: string, value: number, fn?: (upData: {
        currentPP: number,
        err?: string
    }) => Promise<void>) {
        const userInfo = User.userTempData[userId]
        if (!userInfo) return
        if (userInfo.pp - value < 0) {
            fn && await fn({
                currentPP: userInfo.pp,
                err: 'PP值不够，消耗失败！'
            })
            return
        }
        userInfo.pp -= value
        fn && await fn({
            currentPP: userInfo.pp
        })
        await User.setDatabaseUserAttribute(userId)
    },
    /** 给予玩家货币 */
    async giveMonetary(userId: string, val: number, fn?: (upData: {
        val: number,
        currentVal: number,
        err?: string
    }) => Promise<void>) {
        const [bindData] = await User.ctx.database.get('binding', { pid: userId })
        if (bindData && val) {
            const [currentM] = await User.ctx.database.get('monetary', { uid: bindData.aid })
            await User.ctx.monetary.gain(bindData.aid, val)
            fn && await fn({ val, currentVal: currentM.value += val })
        }
    },
    /** 收取玩家货币 */
    async lostMonetary(userId: string, val: number, fn?: (upData: {
        val: number,
        currentVal: number,
        err?: string
    }) => Promise<void>) {
        const [bindData] = await User.ctx.database.get('binding', { pid: userId })
        if (bindData && val) {
            const [currentM] = await User.ctx.database.get('monetary', { uid: bindData.aid })
            if (currentM.value - val < 0) {
                fn && await fn({
                    val: Math.abs(val),
                    currentVal: currentM.value,
                    err: "余额不足！"
                })
                return
            }
            await User.ctx.monetary.cost(bindData.aid, val)
            fn && await fn({
                val: Math.abs(val),
                currentVal: currentM.value - val
            })
        }
    },
    /** 给予玩家指定道具 */
    async giveProps(userId: string, props: { name: string, val?: number }[], fn?: (upData: {
        currentProps: { name: string, val: number }[],
        err?: string
    }) => Promise<void>) {
        const userProps = Props.userPorpsTemp[userId]
        if (!userProps) return

        const upProps = [] as { name: string, val: number }[]
        for (const item of props) {
            const propsItem = propsData[item.name]
            if (!propsData[item.name]) continue
            if (!userProps[item.name]) {
                userProps[item.name] = {
                    name: propsItem.name,
                    type: propsItem.type,
                    value: 0
                }
            }
            userProps[item.name].value += item.val || 1
            upProps.push({ name: item.name, val: userProps[item.name].value })
        }
        await Props.setDatabasePropsData(userId)
        fn && await fn({
            currentProps: upProps
        })
    },
    /** 去除玩家指定道具 */
    async loseProps(userId: string, props: { name: string, val?: number }, fn?: (upData: {
        currentProps: { name: string, val: number },
        err?: string
    }) => Promise<void>) {
        const userProps = Props.userPorpsTemp[userId]
        const propsItem = propsData[props.name]
        if (!userProps) return
        if (!propsItem) {
            fn && await fn({
                currentProps: { name: props.name, val: 0 },
                err: '该道具信息不存在！'
            })
            return
        }
        if (!userProps[props.name]) {
            userProps[props.name] = {
                name: propsItem.name,
                type: propsItem.type,
                value: 0
            }
        }
        if (userProps[props.name].value - (props.val || 1) < 0) {
            fn && await fn({
                currentProps: { name: props.name, val: userProps[props.name].value },
                err: `道具数量不足！剩余${userProps[props.name].value}个。`
            })
            return
        }

        userProps[props.name].value -= props.val || 1
        if (userProps[props.name].value == 0) delete userProps[props.name]
        await Props.setDatabasePropsData(userId)
        fn && await fn({
            currentProps: { name: props.name, val: userProps[props.name]?.value || 0 }
        })
    },
    /** 目标是否死亡 */
    isDie(userId: string) {
        return User.userTempData[userId]?.isDie
    }
}
