import { Context, Session } from "koishi";
import { Config } from ".";
import { User, UserBaseAttribute } from "./users";
import { Monster } from "./monster";
import { Damage, giveCure, giveDamage, moreDamageInfo } from "./damage";
import { generateHealthDisplay, random } from "./utlis";
import { skillFn, SkillType, UseAtkType, UserOccupation } from "./data/skillFn";
import { MonsterBaseAttribute, MonsterOccupation } from "./data/initMonster";
import { settlementBuff } from "./data/buffFn";
import { GensokyoMap } from "./map";

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
    /** 自有类型 */
    selfType: UserOccupation | MonsterOccupation,
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
    gain: BuffGain,
    /** 滞留状态 */
    buff: { [keys: string]: { name: string, timer: number } },
    /** 持有技能 */
    fn?: { name: string, prob: number }[],
    /** 拓展数据 */
    expand: { [keys: string]: any }
}

export type BuffGain = {
    /** 临时增益-最大血量 */
    maxHp?: number,
    /** 临时增益-最大蓝量 */
    maxMp?: number,
    /** 临时增益-攻击力 */
    atk?: number,
    /** 临时增益-防御力 */
    def?: number,
    /** 临时增益-暴击率 */
    chr?: number,
    /** 临时增益-暴击伤害 */
    ghd?: number,
    /** 临时增益-闪避值 */
    evasion?: number,
    /** 临时增益-命中值 */
    hit?: number,
    /** 临时增益-出手速度 */
    speed?: number
    /** 是否眩晕 */
    dizziness?: boolean
    /** 是否混乱 */
    chaos?: boolean
}

/** 最后战斗状态 */
type LastPlay = {
    [keys: string]: {
        self: BattleAttribute[]
        goal: BattleAttribute[]
        isPK?: boolean
    }
}

type InvitationTemp = {
    [keys: string]: {
        time: number,
        for: string,
        playName: string,
        seen: boolean
    }
}

export const BattleData = {
    config: {} as Config,
    ctx: {} as Context,
    historyTemp: {} as BattleHistory,
    lastPlay: {} as LastPlay,
    teamTemp: {} as TeamData,
    invitationTemp: {} as InvitationTemp,
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
    /** 玩家是否在队伍中 通过UserId */
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
                teamList.push(User.getUserAttributeByUserId(item))
            }
        })
        return teamList
    },
    /** 创建队伍 */
    async creatTeam(session: Session) {
        const { userId } = session
        if (BattleData.isTeamByUserId(userId)) {
            await session.send(`${User.getUserName(userId)}:你已经加入了${BattleData.teamTemp[userId].for}的队伍，需要退出才可以重新创建！`)
            return
        }
        BattleData.teamTemp[userId] = {
            for: userId,
            identity: '队长'
        }
        await session.send('创建队伍成功！发送 /队伍邀请 昵称 \n可对周围对应昵称玩家进行组队邀请！')
    },
    /** 邀请加入队伍 */
    async invitationTeam(session: Session, playName: string) {
        const { userId } = session
        if (!BattleData.isTeamByUserId(userId)) {
            await session.send(`你还没有创建队伍，请发送 /队伍创建 创建队伍吧！`)
            return
        }
        const teamInfo = BattleData.teamTemp[userId]
        if (teamInfo.identity !== '队长') {
            await session.send(`你不是小队队长，无法邀请玩家加入！`)
            return
        }

        const nearUser = GensokyoMap.nearbyPlayersByUserId(userId)
        const invitationUser = nearUser.find((item) => item.playName == playName)
        if (!invitationUser) {
            await session.send(`玩家${playName}不在你附近，邀请失败！`)
            return
        }
        if (BattleData.isTeamByUserId(invitationUser.userId)) {
            await session.send(`对方已经组队，或者已经在队伍中！`)
            return
        }
        BattleData.invitationTemp[invitationUser.userId] = {
            time: Date.now(),
            for: userId,
            playName: User.getUserName(userId),
            seen: false
        }
        await session.send(`已经发送邀请，等待TA的 /队伍加入 操作`)
    },
    /** 加入队伍 */
    async joinTeam(session: Session) {
        const { userId } = session
        if (!BattleData.invitationTemp[userId]) {
            await session.send('当前最后记录中无人邀请你加入队伍...')
            return
        }
        if (BattleData.isTeamByUserId(userId)) {
            await session.send(`你已经在队伍中，无法再次加入，若需要加入请发送 /队伍退出`)
            return
        }
        const invInfo = BattleData.invitationTemp[userId]
        if (Date.now() - invInfo.time > 3600000) {
            await session.send(`${invInfo.playName}的邀请队伍请求已超时！`)
            delete BattleData.invitationTemp[userId]
            return
        }
        if (BattleData.teamListByUser(invInfo.for).length >= 4) {
            await session.send(`${invInfo.playName}的队伍人员已满！无法加入`)
            return
        }
        BattleData.teamTemp[userId] = {
            for: invInfo.for,
            identity: '队员'
        }
        await session.send(`加入${invInfo.playName}的队伍成功！\n若后续需要退出可发送 /队伍退出`)
    },
    /** 退出队伍 */
    async exitTeam(session: Session) {
        const { userId } = session
        if (!BattleData.isTeamByUserId(userId)) {
            await session.send('你还没有加入任何队伍！')
            return
        }
        if (BattleData.teamTemp[userId].identity == '队长') {
            await session.send('你是小队队长，无法退出。若要解散队伍，请发送 /队伍解散')
            return
        }
        const teamName = User.getUserName(BattleData.teamTemp[userId].for)
        delete BattleData.teamTemp[userId]
        await session.send(`退出${teamName}的小队成功！`)
    },
    /** 解散队伍 */
    async dissolveTeam(session: Session) {
        const { userId } = session
        if (!BattleData.isTeamByUserId(userId)) {
            await session.send('你还没有加入任何队伍！')
            return
        }
        if (BattleData.teamTemp[userId].identity == '队员') {
            await session.send('你不是小队队长，无法解散。')
            return
        }
        const team = BattleData.teamListByUser(userId)
        team.forEach((item) => {
            delete BattleData.teamTemp[item.userId]
        })
        await session.send('操作成功，已经解散你创建的小队。')
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

        // 状态信息
        const getBuffTemplate = (agent: BattleAttribute) => {
            const dict = { 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
            const buffInfo = Object.keys(agent.buff).map((item) => {
                return `${agent.buff[item].name}${dict[agent.buff[item].timer] || '⁺'}`
            })
            return buffInfo.length ? '(' + buffInfo.join(' ') + ')' : ''
        }
        team.self.forEach((item) => {
            if (item.hp > 0) {
                selfTemp.push(`lv.${item.lv}[${item.name}]${getBuffTemplate(item)}:\n` +
                    `${generateHealthDisplay(item.hp, item.maxHp + item.gain.maxHp)}(${item.hp}/${item.maxHp + item.gain.maxHp})` +
                    `\nMP:${item.mp}/${item.maxMp + item.gain.maxMp}`)
            } else {
                selfTemp.push(`lv.${item.lv}[${item.name}]:已阵亡`)
            }
        })
        team.goal.forEach((item) => {
            if (item.hp > 0) {
                goalTemp.push(`lv.${item.lv}[${item.name}]${getBuffTemplate(item)}:\n` +
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
            return { over: true, type: '平局', win: '' }
        } else if (self) {
            return { over: true, type: team.isPK ? '防御方赢' : '敌方赢', win: 'goal' }
        } else if (goal) {
            return { over: true, type: team.isPK ? '攻击方赢' : '我方赢', win: 'self' }
        }
        return { over: false, type: '未结束', win: '' }
    },
    /** 清理战场 */
    clearBattleData(session: Session) {
        const currentBattle = BattleData.lastPlay[session.userId]
        const allAgentList = [...currentBattle.goal, ...currentBattle.self]
        allAgentList.forEach((item) => {
            if (item.type == '玩家') {
                delete BattleData.lastPlay[item.userId]
            }
        })
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

            // 状态结算
            const buffMsg = settlementBuff(agent)
            buffMsg && msgList.push(buffMsg)

            // 死亡单位跳过回合
            if (agent.hp <= 0) {
                if (agent.type == '玩家' && !User.userTempData[agent.userId]?.isDie) {
                    User.userTempData[agent.userId].hp = 0
                    User.userTempData[agent.userId].isDie = true
                }
                continue;
            }

            // 是否晕眩
            if (!agent.gain.dizziness) {
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

                // 是否混乱
                if (!agent.gain.chaos) {
                    if (agent.type == '玩家' && agent.userId == session.userId) {
                        isMy = true;
                        funType = atkType;
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
                        // 概率释放技能
                        if (random(0, 10) < 4 && agent.fn?.length) {
                            funType = getSkillFn(agent.fn)
                        }
                    }
                } else {
                    const fliteMyList = allAgentList.filter((item) => item.name !== agent.name && item.hp > 0)
                    if (!fliteMyList.length) continue;
                    selectGoal = fliteMyList[Math.random() * fliteMyList.length]
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
                    if (skillFn[funType]) {
                        // 是否为(治疗|增益)技能 特殊处理
                        let _selectGoal = selectGoal
                        if ([SkillType.治疗技, SkillType.增益技].includes(skillFn[funType].type)) {
                            _selectGoal = lifeSelfList.find((item) => item.name == select) || agent
                        }
                        const selectFn = skillFn[funType]
                        // 如果MP消耗足够
                        if (selectFn.mp == 0 || agent.mp - selectFn.mp >= 0) {
                            agent.mp -= selectFn.mp
                            let isNext = false
                            const fnMsg = selectFn.fn({ self: agent, goal: _selectGoal },
                                { selfList: lifeSelfList, goalList: lifeGoalList }, (val) => {
                                    switch (val.type) {
                                        case SkillType.伤害技:
                                            val.target.map((goal) => {
                                                giveDamage(agent, goal, val.damage)
                                            })
                                            break;
                                        case SkillType.治疗技:
                                            val.target.map((goal) => {
                                                giveCure(goal, val.value)
                                            })
                                            break;
                                        case SkillType.增益技:
                                            isMy && val.err && session.send(val.err)
                                            break;
                                        case SkillType.释放失败:
                                            isMy && val.err && session.send(val.err)
                                        default:
                                            break;
                                    }
                                    isNext = val.isNext
                                })
                            fnMsg && msgList.push(fnMsg)
                            isNext && noralAtk()
                        } else {
                            isMy && await session.send(`MP不足，释放失败！`)
                            noralAtk()
                        }
                    } else {
                        isMy && await session.send(`未持有该技能或者该技能不存在，释放失败！`)
                        noralAtk()
                    }
                }
            }
        }
        await session.send(msgList.length ? `战斗记录：\n` + msgList.join('\n') : '')
        await session.send(BattleData.battleSituationTextFormat(currentBattle))
        const result = BattleData.playOver(currentBattle)
        if (result.over) {
            await session.send(result.type)
            await BattleData.settlement(currentBattle, result, session)
            BattleData.clearBattleData(session)
        }
    },
    /** 结算奖励 */
    async settlement(tempData: {
        self: BattleAttribute[];
        goal: BattleAttribute[];
        isPK?: boolean;
    }, overInfo: {
        over: boolean;
        type: string;
        win: string;
    }, session: Session) {
        const allList = [...tempData.self, ...tempData.goal].filter((item) => item.type == '玩家')
        const selfList = tempData.self.filter((item) => item.type == '玩家')
        const goalList = tempData.goal.filter((item) => item.type == '玩家')

        const msg = async (val: {
            name: string
            maxHp: number;
            maxMp: number;
            atk: number;
            def: number;
            lv: number;
        }) => {
            const msgTemp = `${val.name}[升级]${val.lv}级！\n` +
                (val.atk ? `攻击力↑ ${val.atk}\n` : '') +
                (val.def ? `防御力↑ ${val.def}\n` : '') +
                (val.maxHp ? `最大血量↑ ${val.maxHp}\n` : '') +
                (val.maxMp ? `最大蓝量↑ ${val.maxMp}` : '')
            await session.send(msgTemp)
        }
        // 同步状态
        const aynchronize = (agent: BattleAttribute) => {
            User.userTempData[agent.userId].hp = agent.hp > 0 ? agent.hp : 0
            User.userTempData[agent.userId].mp = agent.mp
            if (User.userTempData[agent.userId].hp <= 0) {
                User.userTempData[agent.userId].isDie = true
            }
        }
        if (tempData.isPK) {
            if (overInfo.win == 'self') {
                await session.send('攻击方获得20EXP、5货币')
                for (const agent of allList) {
                    aynchronize(agent)
                    if (agent.for == 'self') {
                        await User.giveExp(agent.userId, 20, async (val) => await msg(val))
                        await User.giveMonetary(agent.userId, 5)
                    }
                }
            } else if (overInfo.win == 'goal') {
                await session.send('防御方获得20EXP、5货币')
                for (const agent of allList) {
                    aynchronize(agent)
                    if (agent.for == 'goal') {
                        await User.giveExp(agent.userId, 20, async (val) => await msg(val))
                        await User.giveMonetary(agent.userId, 5)
                    }
                }
            }
        } else {
            // 获取怪物经验总值
            let val = 0
            // 获得怪物货币总值
            let monetary = 0
            let props = [] as { name: string, val: number }[]
            const monsterName = tempData.goal.filter((item) => item.type == '怪物').map(i => ({ name: i.name, lv: i.lv }))
            monsterName.forEach((item) => {
                const monster = Monster.monsterTempData[item.name]
                if (monster) {
                    val += Math.floor(monster.giveExp + (monster.giveExp * (item.lv - 1) * 0.2))
                    monetary += Math.floor(monster.giveMonetary + (monster.giveExp * (item.lv - 1) * 0.1))
                    // 是否存在掉落奖励？
                    monster.giveProps?.forEach((propsItem) => {
                        if (item.lv >= (propsItem.lv || 1) && random(0, 100) < propsItem.radomVal) {
                            props.push({
                                name: propsItem.name,
                                val: propsItem.const ? propsItem.val : random(1, propsItem.val)
                            })
                        }
                    })
                }
            })

            for (const agent of selfList) {
                aynchronize(agent)
                if (overInfo.win == 'self') {
                    await session.send(`小队获得${val}EXP、${monetary}货币！`)
                    await User.giveExp(agent.userId, val, async (val) => await msg(val))
                    await User.giveMonetary(agent.userId, monetary)
                    props.length && await User.giveProps(agent.userId, props, async (val) => {
                        const propsDict = {}
                        val.currentProps.forEach((item) => {
                            if (!propsDict[item.name]) propsDict[item.name] = 0
                            propsDict[item.name]++
                        })
                        const msg = Object.keys(propsDict).map((item) => {
                            return `${item} ${propsDict[item]}个`
                        }).join('\n')
                        await session.send(`${agent.name}在战斗中获得：` + msg)
                    })
                }
            }
        }
    }
}

/**  获取阵容角色名 */
export function getLineupName(agent: BattleAttribute) {
    return `[${agent.type}]${agent.name}`
}

export function getSkillFn(fnList: { name: string; prob: number }[]): string {
    const totalProb = fnList.reduce((sum, item) => sum + item.prob, 0);
    const random = Math.random() * totalProb;
    let currentProb = 0;
    for (const item of fnList) {
        currentProb += item.prob;
        if (random < currentProb) {
            return item.name;
        }
    }
    return fnList[fnList.length - 1].name;
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
            selfType: userData.type,
            hp: userData.hp,
            maxHp: userData.maxHp,
            mp: userData.mp,
            maxMp: userData.maxMp,
            atk: userData.atk,
            def: userData.def,
            chr: userData.chr,
            ghd: userData.ghd,
            csr: userData.csr,
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
                speed: 0,
                chaos: false,
                dizziness: false
            },
            buff: {},
            fn: [],
            expand: {}
        } as BattleAttribute
        return temp
    } else {
        // 处理怪物数据
        const monsterData = data as MonsterBaseAttribute & { lv: number }
        const temp = {
            name: monsterData.name,
            type: '怪物',
            selfType: monsterData.type,
            lv: monsterData.lv,
            hp: monsterData.hp,
            maxHp: monsterData.maxHp,
            mp: monsterData.mp,
            maxMp: monsterData.maxMp,
            atk: monsterData.atk,
            def: monsterData.def,
            chr: monsterData.chr,
            ghd: monsterData.ghd,
            csr: monsterData.csr,
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
                speed: 0,
                chaos: false,
                dizziness: false
            },
            buff: {},
            fn: monsterData.fn ? JSON.parse(JSON.stringify(monsterData.fn)) : [],
            expand: {}
        } as BattleAttribute
        return temp
    }
}