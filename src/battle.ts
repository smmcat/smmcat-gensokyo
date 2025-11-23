import { Context, Session } from "koishi";
import { Config } from ".";
import { User, UserBaseAttribute } from "./users";
import { Monster, MonsterBaseAttribute } from "./monster";
import { Damage, giveDamage, moreDamageInfo } from "./damage";
import { generateHealthDisplay } from "./utlis";
import { skillFn, SkillType, UseAtkType } from "./skillFn";

declare module 'koishi' {
    interface Tables {
        smm_gensokyo_battle_history: BattleHistory
    }
}


/** 记录封存 */
type BattleHistory = {
    userId: string,
    target: string,
    status: string,
    tempData: {},
    createTime: number
}

/** 队伍信息 */
type TeamData = {
    [keys: string]: {
        for: string,
        identity: '队员' | '队长'
    }
}

export type BattleAttribute = {
    /** 阵容 */
    for?: 'self' | 'goal',
    /** 等级 */
    lv: number
    /** 单位名称 */
    name: string,
    /** 用户唯一标识 */
    userId?: string
    /** 类型 */
    type: '玩家' | '怪物',
    /** 血量 */
    hp: number,
    /** 最大血量 */
    maxHp: number,
    /** 蓝量 */
    mp: number,
    /** 最大蓝量 */
    maxMp: number,
    /** 攻击力 */
    atk: number,
    /** 防御力 */
    def: number,
    /** 暴击率 */
    chr: number,
    /** 暴击抵抗 */
    csr: number,
    /** 暴击伤害 */
    ghd: number,
    /** 闪避值 */
    evasion: number,
    /** 命中值 */
    hit: number,
    /** 出手速度 */
    speed: number,
    /** 临时增益状态 */
    gain: {
        /** 临时增益-最大血量 */
        maxHp: number,
        /** 临时增益-最大蓝量 */
        maxMp: number,
        /** 临时增益-攻击力 */
        atk: number,
        /** 临时增益-防御力 */
        def: number,
        /** 临时增益-暴击率 */
        chr: number,
        /** 临时增益-暴击伤害 */
        ghd: number,
        /** 临时增益-闪避值 */
        evasion: number,
        /** 临时增益-命中值 */
        hit: number,
        /** 临时增益-出手速度 */
        speed: number
    },
    /** 滞留状态 */
    buff: { name: string, time: number }[],
    /** 持有技能 */
    fn?: []
}

/** 最后战斗状态 */
type LastPlay = {
    [keys: string]: {
        self: BattleAttribute[]
        goal: BattleAttribute[]
        isPK?: boolean
    }
}

export const BattleData = {
    config: {} as Config,
    ctx: {} as Context,
    historyTemp: {} as BattleHistory,
    lastPlay: {} as LastPlay,
    teamTemp: {} as TeamData,
    init(config: Config, ctx: Context) {
        this.config = config
        this.ctx = ctx
    },
    /** 玩家是否正在战斗 */
    isBattle(session: Session) {
        return !!BattleData.lastPlay[session.userId]
    },
    /** 玩家是否正在战斗 */
    isBattleByUserId(userId: string) {
        return !!BattleData.lastPlay[userId]
    },
    /** 玩家是否在队伍中 */
    isTeam(session: Session) {
        return !!BattleData.teamTemp[session.userId]
    },
    isTeamByUserId(userId: string) {
        return !!BattleData.teamTemp[userId]
    },
    // 返回队伍信息
    teamListByUser(userId: string) {
        const teamList = [] as UserBaseAttribute[]
        // 寻找队伍人员
        if (!BattleData.teamTemp[userId]) {
            return []
        }
        // 获取队长 userId
        const _userId = BattleData.teamTemp[userId].for
        Object.keys(BattleData.teamTemp).forEach((item) => {
            if (BattleData.teamTemp[item].for == _userId) {
                // 组队战斗
                teamList.push(User.getUserAttributeByUserId(item))
            }
        })
        return teamList
    },
    /** 创建战斗-与怪物 */
    async createBattleByMonster(session: Session, goal: { name: string, lv: number }[]) {
        if (BattleData.isBattle(session)) {
            await session.send('当前正在战斗，还不能逃脱！')
            return
        }
        // 玩家队伍列表
        const battle_user = [] as BattleAttribute[]
        // 怪物队伍列表
        const battle_monsterList = [] as BattleAttribute[]
        // 玩家 userId 信息
        const playUser = []

        if (BattleData.isTeam(session) && BattleData.teamTemp[session.userId].identity == '队员') {
            await session.send('你不是队伍的队长，无法主动操作战斗！')
            return
        } else if (BattleData.isTeam(session)) {
            // 寻找队伍人员
            Object.keys(BattleData.teamTemp).forEach((item) => {
                if (BattleData.teamTemp[item].for == session.userId) {
                    // 组队战斗
                    playUser.push(item)
                    battle_user.push(initBattleAttribute(User.getUserAttributeByUserId(item)))
                }
            })
        } else {
            // 单人战斗
            playUser.push(session.userId)
            battle_user.push(initBattleAttribute(User.getUserAttributeByUserId(session.userId)))
        }

        // 组织怪物阵容
        goal.forEach((item) => {
            battle_monsterList.push(initBattleAttribute(Monster.getMonsterAttributeData(item.name, item.lv)))
        })
        const temp = {
            self: battle_user.map((i) => ({ ...i, for: 'self' as 'self' | 'goal' })),
            goal: battle_monsterList.map((i) => ({ ...i, for: 'goal' as 'self' | 'goal' })),
        }
        // 存档战斗
        playUser.forEach((userId) => {
            // 每个队员都进行存档
            BattleData.lastPlay[userId] = temp
        })
        await session.send(`开始与 ${goal.map(i => i.name).join('、')} 进行战斗`)
    },
    /** 创建战斗-与玩家 */
    async createBattleByUser(session: Session, goal: { userId: string }[]) {
        if (BattleData.isBattle(session)) {
            await session.send('当前正在战斗，还不能逃脱！')
            return
        }
        // 玩家队伍列表
        const battle_self = [] as BattleAttribute[]
        // 怪物队伍列表
        const battle_goal = [] as BattleAttribute[]
        // 玩家 userId 信息
        const playUser = []

        const lostMsg = []
        goal = goal.filter((item) => {
            const isBattle = BattleData.isBattleByUserId(item.userId)
            const pyUser = User.userTempData[item.userId]
            if (isBattle) {
                lostMsg.push(`${pyUser.playName}正在参与着一场战斗，无法被PK选中。`)
                return false
            }
            return true
        })
        if (lostMsg.length) {
            await session.send(lostMsg.join('\n'))
        }

        if (!goal.length) {
            lostMsg.push(`PK失败，无任何目标进行PK`)
            return
        }

        if (BattleData.isTeam(session) && BattleData.teamTemp[session.userId].identity == '队员') {
            await session.send('你不是队伍的队长，无法主动操作战斗！')
            return
        } else if (BattleData.isTeam(session)) {
            // 寻找队伍人员
            Object.keys(BattleData.teamTemp).forEach((item) => {
                if (BattleData.teamTemp[item].for == session.userId) {
                    // 组队战斗
                    playUser.push(item)
                    battle_self.push(initBattleAttribute(User.getUserAttributeByUserId(item)))
                }
            })
        } else {
            // 单人战斗
            playUser.push(session.userId)
            battle_self.push(initBattleAttribute(User.getUserAttributeByUserId(session.userId)))
        }

        // 组织敌对阵容
        goal.forEach((item) => {
            playUser.push(item.userId)
            battle_goal.push(initBattleAttribute(User.getUserAttributeByUserId(item.userId)))
        })
        const pkTemp = {
            self: battle_self.map((i) => ({ ...i, for: 'self' as 'self' | 'goal' })),
            goal: battle_goal.map((i) => ({ ...i, for: 'goal' as 'self' | 'goal' })),
            isPK: true
        }
        // 存档战斗
        playUser.forEach((userId) => {
            // 每个队员都进行存档
            BattleData.lastPlay[userId] = pkTemp
        })
        await session.send(`开始与玩家 ${battle_goal.map(i => i.name).join('、')} 进行PK战斗`)
    },
    /** 文本化当前战况 */
    battleSituationTextFormat(team: { self: BattleAttribute[], goal: BattleAttribute[], isPK?: boolean }) {
        const selfTemp = []
        const goalTemp = []
        team.self.forEach((item) => {
            if (item.hp > 0) {
                selfTemp.push(`lv.${item.lv}[${item.name}]:\n` +
                    `${generateHealthDisplay(item.hp, item.maxHp + item.gain.maxHp)}(${item.hp}/${item.maxHp + item.gain.maxHp})` +
                    `\nMP:${item.mp}/${item.maxMp + item.gain.maxMp}`)
            } else {
                selfTemp.push(`lv.${item.lv}[${item.name}]:已阵亡`)
            }
        })
        team.goal.forEach((item) => {
            if (item.hp > 0) {
                goalTemp.push(`lv.${item.lv}[${item.name}]:\n` +
                    `${generateHealthDisplay(item.hp, item.maxHp + item.gain.maxHp)}(${item.hp}/${item.maxHp + item.gain.maxHp})` +
                    `\nMP:${item.mp}/${item.maxMp + item.gain.maxMp}`)
            } else {
                goalTemp.push(`lv.${item.lv}[${item.name}]:已阵亡`)
            }
        })
        if (team.isPK) {
            return `[当前战况]\n攻击方：\n` + selfTemp.join('\n') + '\n\n' + '防御方：\n' + goalTemp.join('\n')
        }
        return `[当前战况]\n我方阵容：\n` + selfTemp.join('\n') + '\n\n' + '敌方阵容：\n' + goalTemp.join('\n')
    },
    /** 判断输赢 */
    playOver(team: { self: BattleAttribute[], goal: BattleAttribute[], isPK?: boolean }) {
        const self = team.self.every((item) => item.hp <= 0)
        const goal = team.goal.every((item) => item.hp <= 0)
        if (self && goal) {
            return { over: true, type: '平局' }
        } else if (self) {
            return { over: true, type: team.isPK ? '防御方赢' : '敌方赢' }
        } else if (goal) {
            return { over: true, type: team.isPK ? '攻击方赢' : '我方赢' }
        }
        return { over: false, type: '未结束' }
    },
    /** 清理战场 */
    clearBattleData(session: Session) {
        if (BattleData.isTeam(session)) {
            const currentBattle = BattleData.lastPlay[session.userId]
            const allAgentList = [...currentBattle.goal, ...currentBattle.self].sort((a, b) => b.speed - a.speed)
            allAgentList.forEach((item) => {
                if (item.type == '玩家') {
                    delete BattleData.lastPlay[item.userId]
                }
            })
        } else {
            // 单人战斗
            delete BattleData.lastPlay[session.userId]
        }
    },
    async play(session: Session, atkType: string, select?: string) {
        if (!BattleData.isBattle(session)) {
            await session.send('您并没有任何参与战斗。')
            return
        }

        const currentBattle = BattleData.lastPlay[session.userId]
        const allAgentList = [...currentBattle.goal, ...currentBattle.self].sort((a, b) => b.speed - a.speed)
        const msgList = []

        for (const agent of allAgentList) {
            // 死亡单位跳过回合
            if (agent.hp <= 0) continue;

            // 过滤存活目标
            let lifeGoalList = [] as BattleAttribute[]
            let lifeSelfList = [] as BattleAttribute[]
            if (agent.for == 'self') {
                lifeGoalList = currentBattle.goal.filter((item) => item.for == 'goal' && item.hp > 0)
                lifeSelfList = currentBattle.self.filter((item) => item.for == 'self' && item.hp > 0)
            } else {
                lifeGoalList = currentBattle.self.filter((item) => item.for == 'self' && item.hp > 0)
                lifeSelfList = currentBattle.goal.filter((item) => item.for == 'goal' && item.hp > 0)
            }
            // 无目标
            if (!lifeGoalList.length) continue;

            // 准备挑选对手
            let selectGoal = {} as BattleAttribute
            let isMy = false // 是否为本人操作
            let funType = '普攻' // 攻击的方式
            if (agent.type == '玩家' && agent.userId == session.userId) {
                isMy = true
                funType = atkType
                selectGoal = lifeGoalList.find((item) => item.name == select) ||
                    lifeGoalList[Math.floor(Math.random() * lifeGoalList.length)]
            }
            // 其他玩家操作
            else if (agent.type == '玩家') {
                selectGoal = lifeGoalList[Math.floor(Math.random() * lifeGoalList.length)]
            }
            // 怪物操作
            else {
                selectGoal = lifeGoalList[Math.floor(Math.random() * lifeGoalList.length)]
            }

            // 普通攻击
            const noralAtk = () => {
                const damageInfo = new Damage({ self: agent, goal: selectGoal }).result()
                giveDamage(agent, selectGoal, damageInfo)
                msgList.push(`${getLineupName(agent)} 使用普攻攻击了 ${getLineupName(selectGoal)}，`
                    + `造成了${damageInfo.harm}伤害。` + moreDamageInfo(damageInfo)
                )
            }
            if (funType == '普攻') {
                noralAtk()
            } else {
                // 尝试释放技能
                if (skillFn[atkType]) {
                    const selectFn = skillFn[atkType]
                    // 如果MP消耗足够
                    if (selectFn.mp == 0 || agent.mp - selectFn.mp >= 0) {
                        agent.mp -= selectFn.mp
                        let isNext = false
                        const fnMsg = selectFn.fn({ self: agent, goal: selectGoal },
                            { selfList: lifeSelfList, goalList: lifeGoalList }, (val) => {
                                switch (val.type) {
                                    case SkillType.伤害技:
                                        val.target.map((goal) => {
                                            giveDamage(agent, goal, val.damage)
                                        })
                                        break;
                                    case SkillType.释放失败:
                                        val.err && session.send(val.err)
                                    default:
                                        break;
                                }
                                isNext = val.isNext
                            })
                        fnMsg && msgList.push(fnMsg)
                        isNext && noralAtk()
                    } else {
                        await session.send(`MP不足，释放失败！`)
                        noralAtk()
                    }
                } else {
                    await session.send(`未持有该技能或者该技能不存在，释放失败！`)
                    noralAtk()
                }
            }
        }
        await session.send(msgList.length ? `战斗记录：\n` + msgList.join('\n') : '')
        await session.send(BattleData.battleSituationTextFormat(currentBattle))
        const result = BattleData.playOver(currentBattle)
        if (result.over) {
            await session.send(result.type)
            BattleData.clearBattleData(session)
        }
    }
}

/**  获取阵容角色名 */
export function getLineupName(agent: BattleAttribute) {
    return `[${agent.type}]${agent.name}`
}

/** 初始化战斗属性-用户 */
function initBattleAttribute(data: UserBaseAttribute): BattleAttribute
/** 初始化战斗属性-怪物 */
function initBattleAttribute(data: MonsterBaseAttribute): BattleAttribute
function initBattleAttribute(data: UserBaseAttribute | MonsterBaseAttribute): BattleAttribute {
    if ('playName' in data) {
        // 处理用户数据
        const userData = data as UserBaseAttribute
        const temp = {
            userId: userData.userId,
            name: userData.playName,
            lv: userData.lv,
            type: '玩家',
            hp: userData.hp,
            maxHp: userData.maxHp,
            mp: userData.mp,
            maxMp: userData.maxMp,
            atk: userData.atk,
            def: userData.def,
            chr: userData.chr,
            ghd: userData.ghd,
            csr: 0,
            evasion: userData.evasion,
            hit: userData.hit,
            speed: userData.speed,
            gain: {
                maxHp: 0,
                maxMp: 0,
                atk: 0,
                def: 0,
                chr: 0,
                ghd: 0,
                evasion: 0,
                hit: 0,
                speed: 0
            },
            buff: [],
            fn: []
        } as BattleAttribute
        return temp
    } else {
        // 处理怪物数据
        const monsterData = data as MonsterBaseAttribute & { lv: number }
        const temp = {
            name: monsterData.name,
            type: '怪物',
            lv: monsterData.lv,
            hp: monsterData.hp,
            maxHp: monsterData.maxHp,
            mp: monsterData.mp,
            maxMp: monsterData.maxMp,
            atk: monsterData.atk,
            def: monsterData.def,
            chr: monsterData.chr,
            ghd: monsterData.ghd,
            csr: 0,
            evasion: monsterData.evasion,
            hit: monsterData.hit,
            speed: monsterData.speed,
            gain: {
                maxHp: 0,
                maxMp: 0,
                atk: 0,
                def: 0,
                chr: 0,
                ghd: 0,
                evasion: 0,
                hit: 0,
                speed: 0
            },
            buff: [],
            fn: []
        } as BattleAttribute
        return temp
    }
}