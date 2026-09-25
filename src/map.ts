import { Context, Session } from "koishi";
import { Config } from ".";
import { User, UserBaseAttribute } from "./users";
import { BattleData } from "./battle";
import { base64ToWebUrl, random } from "./utlis";
import { Chat } from "./chatSend";
import { AreaType, BseMap } from "./data/initMap";
import { generateMiniMapHTML } from "./mapHtml";


declare module 'koishi' {
    interface Tables {
        smm_gensokyo_map_position: UserPosition
    }
}

/** 区域信息 */
export type AreaItem = {
    /** 层级 */
    floor: number,
    /** 区域名 */
    areaName: string,
    /** 区域类型 */
    type: AreaType
    /** 需要等级 */
    needLv: number,
    /** 额外信息说明 */
    info?: string,
    /** 区域NPC */
    npc?: string[],
    /** 区域野怪 */
    monster?: { name: string, lv: number }[],
    /** 是否存在商店 */
    shopName?: string,
    /** 需要持有道具可进入 */
    needProps?: string,
    /** 上方区域 */
    top?: string,
    /** 下方区域 */
    down?: string,
    /** 左方区域 */
    left?: string,
    /** 右方区域 */
    right?: string
}

/** 顶级区域数据 */
export type BaseAreaData = {
    /** 世界层 */
    [keys: number]: {
        /** 区域 */
        [keys: string]: AreaItem
    }
}

/** 移动后的区域信息 */
export type AreaCallbackData = {
    user: UserPosition,
    map: AreaItem
}

/** 移动枚举 */
export enum MoveType {
    上 = "top",
    下 = "down",
    左 = "left",
    右 = "right"
}

/** 用户当前区域信息 */
type UserPosition = {
    floor: number,
    areaName: string,
    moveing: boolean,
    playName: string,
    userId: string
}

/** 用户列表区域信息 */
type UserPositionData = {
    [keys: string]: UserPosition
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const GensokyoMap = {
    config: {} as Config,
    ctx: {} as Context,
    mapLocalData: {} as BaseAreaData,
    userCurrentLoal: {} as UserPositionData,
    async init(config: Config, ctx: Context) {
        GensokyoMap.config = config;
        GensokyoMap.ctx = ctx;

        ctx.database.extend('smm_gensokyo_map_position', {
            userId: 'string',
            floor: 'integer',
            areaName: 'string',
            moveing: 'boolean',
            playName: 'string'
        }, {
            primary: 'userId',
            autoInc: false
        })

        // 地图数据
        GensokyoMap.mapLocalData = BseMap
        console.log(JSON.stringify(GensokyoMap.mapLocalData));

        // 位置信息获取
        const userPoistionList = await ctx.database.get('smm_gensokyo_map_position', {})
        const poistionTemp = {}
        userPoistionList.forEach((poistion) => {
            poistion.moveing = false
            poistionTemp[poistion.userId] = poistion
        })
        GensokyoMap.userCurrentLoal = poistionTemp
    },
    /** 获取层的数据 */
    getBaseFloorLocal(floor: number) {
        return GensokyoMap.mapLocalData[floor] || null
    },
    /** 获取用户当前区域信息 */
    getUserCurrentArea(userid: string) {
        const { floor, areaName } = GensokyoMap.userCurrentLoal[userid] || {} as UserPosition
        if (!(floor && areaName)) return null
        return GensokyoMap.mapLocalData[floor][areaName] || null
    },
    /** 初始化用户位置 */
    initUserPoistion(session: Session, userData: UserBaseAttribute) {
        if (!GensokyoMap.userCurrentLoal[session.userId]) {
            GensokyoMap.userCurrentLoal[session.userId] = {
                userId: session.userId,
                floor: 1,
                areaName: '传送门',
                moveing: false,
                playName: userData.playName
            }
        }
        GensokyoMap.setLocalStoragePoistionData(session.userId)
    },
    /** 位置信息存储到数据库 */
    async setLocalStoragePoistionData(userId: string) {
        const poistionData = { ...GensokyoMap.userCurrentLoal[userId] }
        if (poistionData) {
            const [localData] = await GensokyoMap.ctx.database.get('smm_gensokyo_map_position', { userId })
            // 如果没有数据，创建初始数据
            if (!localData) {
                await GensokyoMap.ctx.database.create('smm_gensokyo_map_position', poistionData)
                return
            }
            delete poistionData.userId
            await GensokyoMap.ctx.database.set('smm_gensokyo_map_position', { userId }, poistionData)
        }
    },
    /** 用户移动 */
    async move(session: Session, type: MoveType, fn?: (area: AreaCallbackData) => Promise<void>) {
        try {
            const userCurrentArea = GensokyoMap.userCurrentLoal[session.userId] || {} as UserPosition
            const { floor, areaName, moveing } = userCurrentArea
            if (moveing) {
                await Chat.send(session, '当前移动冷却中，请稍等...')
                return
            }
            if (!(floor && areaName)) {
                await Chat.send(session, '您当前位置有误，请使用(还没写好的指令)脱离卡死...')
                return
            }
            userCurrentArea.moveing = true
            const nowPosition = GensokyoMap.mapLocalData[floor][areaName]
            if (!nowPosition[type]) {
                await Chat.send(session, '抱歉，此路不通！')
                userCurrentArea.moveing = false
                return
            }
            const newArea = GensokyoMap.mapLocalData[floor][nowPosition[type]]
            if (!newArea) {
                await Chat.send(session, '进入失败，地图中不存在 ' + nowPosition[type] + ' 这个区域。')
                userCurrentArea.moveing = false
                return
            }
            if (newArea.type == AreaType.禁用) {
                await Chat.send(session, `该区域暂时未开放...`)
                userCurrentArea.moveing = false
                return
            }
            if (newArea.needLv > User.userTempData[session.userId].lv) {
                await Chat.send(session, `当前区域由于您的等级未达到最低要求，暂时无法进入。\n需要等级：${newArea.needLv}级`)
                userCurrentArea.moveing = false
                return
            }

            // 如果存在小队，一起移动
            if (BattleData.isTeam(session)) {
                const { userId } = session
                const myTeamList = []
                Object.keys(BattleData.teamTemp).forEach((_userId) => {
                    if (BattleData.teamTemp[_userId].for == userId && userId !== _userId) {
                        myTeamList.push(_userId)
                    }
                })
                // 队伍中是否存在低于目标地图要求进入等级的玩家
                const belowUser = myTeamList.filter((teamUserId) => newArea.needLv > User.userTempData[teamUserId].lv)
                if (belowUser.length) {
                    await Chat.send(session, `移动失败！队伍存在限制进入等级(lv.${newArea.needLv})玩家，\n` +
                        `目前限制进入的玩家：\n${belowUser.map((item) => {
                            return `Lv.${User.userTempData[item].lv} ${User.userTempData[item].playName}`
                        }).join('\n')}`
                    )
                    userCurrentArea.moveing = false
                    return
                }
                for (const moveTeamUserId of myTeamList) {
                    GensokyoMap.userCurrentLoal[moveTeamUserId].areaName = newArea.areaName
                    GensokyoMap.userCurrentLoal[moveTeamUserId].floor = newArea.floor
                    GensokyoMap.userCurrentLoal[moveTeamUserId].moveing = false
                    await GensokyoMap.setLocalStoragePoistionData(moveTeamUserId)
                }
            }

            userCurrentArea.areaName = newArea.areaName
            userCurrentArea.floor = newArea.floor
            const areaInfo = {
                user: { ...userCurrentArea },
                map: { ...newArea }
            }
            fn && await fn(areaInfo)
            userCurrentArea.moveing = false
            GensokyoMap.setLocalStoragePoistionData(session.userId)
            await delay(3000)
            return
        } catch (error) {
            console.log(error);
            if (GensokyoMap.userCurrentLoal?.[session.userId]) {
                GensokyoMap.userCurrentLoal[session.userId].moveing = false
            }
        }
    },
    /** 发起遭遇战 */
    async encounter(session: Session, val: AreaCallbackData) {
        // 概率遇到怪物
        if (val.map.type == AreaType.冒险区 && val.map.monster?.length) {
            if (random(0, 10) <= 9) {
                const selectMonster = val.map.monster[random(0, val.map.monster.length - 1)]
                if (GensokyoMap.config.useMd) {
                    const msg = `糟糕！你被 Lv.${selectMonster.lv} ${selectMonster.name} 发现，即将进行战斗！你可发送 [打怪攻击](mqqapi://aio/inlinecmd?command=/打怪攻击&enter=false&reply=false) 或者 [打怪技能](mqqapi://aio/inlinecmd?command=/打怪技能&enter=false&reply=false) 进行对战。`
                    await Chat.send(session, msg)
                } else {
                    await Chat.send(session, `糟糕！你被 Lv.${selectMonster.lv} ${selectMonster.name} 发现，强制发生战斗！`)
                }
                await BattleData.createBattleByMonster(session, [selectMonster])
            }
        }
    },
    /** 用户传送楼层 */
    async jumpFloor(session: Session, afterFloor: number, fn?: (area: AreaCallbackData) => Promise<void>) {
        const userCurrentArea = GensokyoMap.userCurrentLoal[session.userId] || {} as UserPosition
        const { floor, areaName, moveing } = userCurrentArea
        if (moveing) {
            await Chat.send(session, '当前移动冷却中，请稍等...')
            return
        }
        if (!(floor && areaName)) {
            await Chat.send(session, '您当前位置有误，请使用(还没写好的指令)脱离卡死...')
            return
        }
        if (floor == afterFloor) {
            await Chat.send(session, '目标层和当前层一致，无需传送！')
            return
        }
        userCurrentArea.moveing = true
        const newFloorMap = GensokyoMap.mapLocalData[afterFloor]
        if (!newFloorMap) {
            await Chat.send(session, '未存在该层，传送失败！')
            userCurrentArea.moveing = false
            return
        }
        const currentArea = Object.keys(newFloorMap).find((areaName) => newFloorMap[areaName].type == AreaType.传送门)
        if (!currentArea) {
            await Chat.send(session, '目标传送层不存在传送门区域，传送失败...')
            userCurrentArea.moveing = false
            return
        }
        const afterArea = newFloorMap[currentArea]
        console.log(newFloorMap[currentArea]);


        // 如果存在小队，一起移动
        if (BattleData.isTeam(session)) {
            const { userId } = session
            const myTeamList = []
            Object.keys(BattleData.teamTemp).forEach((_userId) => {
                if (BattleData.teamTemp[_userId].for == userId && userId !== _userId) {
                    myTeamList.push(_userId)
                }
            })
            // 队伍中是否存在低于目标地图要求进入等级的玩家
            const belowUser = myTeamList.filter((teamUserId) => afterArea.needLv > User.userTempData[teamUserId].lv)
            if (belowUser.length) {
                await Chat.send(session, `移动失败！队伍存在限制进入等级(lv.${afterArea.needLv})玩家，\n` +
                    `目前限制进入的玩家：\n${belowUser.map((item) => {
                        return `Lv.${User.userTempData[item].lv} ${User.userTempData[item].playName}`
                    }).join('\n')}`
                )
                userCurrentArea.moveing = false
                return
            }
            for (const moveTeamUserId of myTeamList) {
                GensokyoMap.userCurrentLoal[moveTeamUserId].areaName = afterArea.areaName
                GensokyoMap.userCurrentLoal[moveTeamUserId].floor = afterArea.floor
                GensokyoMap.userCurrentLoal[moveTeamUserId].moveing = false
                await GensokyoMap.setLocalStoragePoistionData(moveTeamUserId)
            }
        }

        userCurrentArea.areaName = afterArea.areaName
        userCurrentArea.floor = afterArea.floor
        const areaInfo = {
            user: { ...userCurrentArea },
            map: { ...afterArea }
        }
        fn && await fn(areaInfo)
        userCurrentArea.moveing = false
        GensokyoMap.setLocalStoragePoistionData(session.userId)
        await delay(3000)
    },
    /** 查询附近玩家 */
    nearbyPlayersByUserId(userId: string) {
        const areaData = GensokyoMap.getUserCurrentArea(userId)
        const liveUser = [] as { userId: string, playName: string }[]
        // 获取区域玩家信息
        Object.keys(GensokyoMap.userCurrentLoal).forEach((_userId) => {
            const userItem = GensokyoMap.userCurrentLoal[_userId]
            if (userItem.areaName == areaData.areaName && userItem.floor == areaData.floor) {
                if (userId !== userItem.userId) {
                    liveUser.push({ userId: userItem.userId, playName: userItem.playName })
                }
            }
        })
        return liveUser
    },
    /** 区域信息格式化 */
    async userAreaTextFormat(gameName: string, data: AreaCallbackData) {
        const liveUser = []
        // 获取区域玩家信息
        Object.keys(GensokyoMap.userCurrentLoal).forEach((userId) => {
            const areaItem = GensokyoMap.userCurrentLoal[userId]
            if (areaItem.areaName == data.map.areaName && areaItem.floor == data.map.floor) {
                if (gameName !== areaItem.playName) {
                    liveUser.push(areaItem.playName)
                }
            }
        })
        let html = ''
        if (GensokyoMap.config.openCurrentMap) {
            try {
                const mapLocal = GensokyoMap.mapLocalData[data.map.floor]
                const maphtml = generateMiniMapHTML(mapLocal, data.map.areaName)
                html = await GensokyoMap.ctx.puppeteer.render(maphtml)
            } catch (error) {
                console.log(error);
            }
        }

        const str = html + `${gameName}[萌新] 当前位置：\n`
        const mapInfo = `区域：【${data.map.areaName}】\n` +
            (data.map.info ? data.map.info + '\n\n' : '\n') +
            (data.map.top ? `上：【${data.map.top}】\n` : '') +
            (data.map.down ? `下：【${data.map.down}】\n` : '') +
            (data.map.left ? `左：【${data.map.left}】\n` : '') +
            (data.map.right ? `右：【${data.map.right}】\n` : '') +
            (data.map.type == AreaType.传送门 ? `\n[!]传送门区域` : '') +
            (data.map.shopName ? `\n[!]存在商店：${data.map.shopName}` : '') +
            (data.map.npc ? `\n[!]存在npc：${data.map.npc.join('、')}` : '') +
            (data.map.monster ? `\n[!]存在野怪：${data.map.monster.map(i => `lv.${i.lv} ${i.name}`).join('、')}` : '') +
            (liveUser.length ? `\n[!]区域玩家：${liveUser.length > 3 ? liveUser.slice(0, 3).join('、') +
                `...等${liveUser.length}名玩家` : liveUser.join('、')}` : '')
        return str + mapInfo
    },
    /** 区域信息 md 格式化 */
    async userAreaTextMdFormat(gameName: string, data: AreaCallbackData) {
        const liveUser = []
        // 获取区域玩家信息
        Object.keys(GensokyoMap.userCurrentLoal).forEach((userId) => {
            const areaItem = GensokyoMap.userCurrentLoal[userId]
            if (areaItem.areaName == data.map.areaName && areaItem.floor == data.map.floor) {
                if (gameName !== areaItem.playName) {
                    liveUser.push(areaItem.playName)
                }
            }
        })
        let picUrl = null
        if (GensokyoMap.config.openCurrentMap) {
            const mapLocal = GensokyoMap.mapLocalData[data.map.floor]
            const maphtml = generateMiniMapHTML(mapLocal, data.map.areaName)
            const html = await GensokyoMap.ctx.puppeteer.render(maphtml)
            const reg = /<img\b[^>]*\bsrc\s*=\s*["'](data:[^"']+)["'][^>]*\/?>/i;
            const match = html.match(reg);
            const src = match?.[1];
            if (src) {
                try {
                    picUrl = await base64ToWebUrl(src, GensokyoMap.ctx)
                } catch (error) {
                    console.log(error);
                }
            }
        }
        const str = `${gameName}[萌新] 当前位置：\n`
        const mapInfo = `${picUrl ? `![pic #300px #187px](${picUrl})\n` : ''}` +
            `区域：【${data.map.areaName}】\n` +
            (data.map.info ? data.map.info + '\n\n' : '\n') +
            (data.map.top ? `上：[【${data.map.top}】](mqqapi://aio/inlinecmd?command=/移动 上&enter=true&reply=false)\n` : '') +
            (data.map.down ? `下：[【${data.map.down}】](mqqapi://aio/inlinecmd?command=/移动 下&enter=true&reply=false)\n` : '') +
            (data.map.left ? `左：[【${data.map.left}】](mqqapi://aio/inlinecmd?command=/移动 左&enter=true&reply=false)\n` : '') +
            (data.map.right ? `右：[【${data.map.right}】](mqqapi://aio/inlinecmd?command=/移动 右&enter=true&reply=false)\n` : '') +
            (data.map.type == AreaType.传送门 ? `\n[!]传送门区域` : '') +
            (data.map.shopName ? `\n[!]存在商店：${data.map.shopName}` : '') +
            (data.map.npc ? `\n[!]存在npc：${data.map.npc.join('、')}` : '') +
            (data.map.monster ? `\n[!]存在野怪：${data.map.monster.map(i => `lv.${i.lv} ${i.name}`).join('、')}` : '') +
            (liveUser.length ? `\n[!]区域玩家：${liveUser.length > 3 ? liveUser.slice(0, 3).join('、') +
                `...等${liveUser.length}名玩家` : liveUser.join('、')}` : '')
        return str + mapInfo
    }
}