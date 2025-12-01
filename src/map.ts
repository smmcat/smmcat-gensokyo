import { Context, Session } from "koishi";
import { Config } from ".";
import { UserBaseAttribute } from "./users";

/** 区域类型枚举 */
export enum AreaType {
    安全区 = "安全区", 冒险区 = "冒险区", 商店 = "商店", 地牢 = "地牢", 传送门 = "传送门", 禁用 = "禁用", BOSS区 = "BOSS区"
}
declare module 'koishi' {
    interface Tables {
        smm_gensokyo_map_position: UserPosition
    }
}

/** 区域信息 */
type AreaItem = {
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
type BaseAreaData = {
    /** 世界层 */
    [keys: number]: {
        /** 区域 */
        [keys: string]: AreaItem
    }
}

/** 移动后的区域信息 */
type AreaCallbackData = {
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
        GensokyoMap.mapLocalData = {
            1: {
                "地下墓穴": {
                    floor: 1,
                    areaName: "地下墓穴",
                    type: AreaType.BOSS区,
                    needLv: 1,
                    down: "蜘蛛洞穴"
                },
                "蜘蛛洞穴": {
                    floor: 1,
                    areaName: "蜘蛛洞穴",
                    type: AreaType.冒险区,
                    needLv: 1,
                    down: "蜘蛛森林一"
                },
                "蜘蛛森林一": {
                    floor: 1,
                    areaName: "蜘蛛森林一",
                    type: AreaType.冒险区,
                    needLv: 1,
                    monster: [{ name: "小蜘蛛", lv: 2 }],
                    top: "蜘蛛洞穴",
                    left: "蜘蛛森林二",
                    right: "蜘蛛森林三",
                    down: "蜘蛛森林通道"
                },
                "蜘蛛森林二": {
                    floor: 1,
                    areaName: "蜘蛛森林二",
                    type: AreaType.冒险区,
                    needLv: 1,
                    right: "蜘蛛森林一"
                },
                "蜘蛛森林三": {
                    floor: 1,
                    areaName: "蜘蛛森林三",
                    type: AreaType.冒险区,
                    needLv: 1,
                    left: "蜘蛛森林一",
                    monster: [{ name: '大妖精', lv: 3 }]
                },
                "蜘蛛森林通道": {
                    floor: 1,
                    areaName: "蜘蛛森林通道",
                    type: AreaType.冒险区,
                    needLv: 1,
                    top: "蜘蛛森林一",
                    down: "中央广场"
                },
                "中央广场": {
                    floor: 1,
                    areaName: "中央广场",
                    info: "一层的中心位置，梦开始的地方",
                    npc: ["aipo"],
                    type: AreaType.安全区,
                    needLv: 1,
                    top: "蜘蛛森林通道",
                    down: "新手村",
                    left: "酒馆",
                    right: "银行"
                },
                "酒馆": {
                    floor: 1,
                    areaName: "酒馆",
                    type: AreaType.安全区,
                    needLv: 1,
                    down: "传送门",
                    right: "中央广场"
                },
                "银行": {
                    floor: 1,
                    areaName: "银行",
                    type: AreaType.安全区,
                    needLv: 1,
                    down: "1层-商店",
                    left: "中央广场"
                },
                "1层-商店": {
                    floor: 1,
                    areaName: "1层-商店",
                    type: AreaType.安全区,
                    needLv: 1,
                    right: "农田",
                    left: "新手村"
                },
                "传送门": {
                    floor: 1,
                    areaName: "传送门",
                    type: AreaType.传送门,
                    needLv: 1,
                    top: "酒馆",
                    right: "新手村",
                    left: "爱之湖"
                },
                "爱之湖": {
                    floor: 1,
                    areaName: "传送门",
                    type: AreaType.安全区,
                    needLv: 1,
                    right: "传送门"
                },
                "新手村": {
                    floor: 1,
                    areaName: "新手村",
                    type: AreaType.安全区,
                    needLv: 1,
                    top: "中央广场",
                    down: "绿野平原通道",
                    left: "传送门",
                    right: "1层-商店"
                },
                "绿野平原通道": {
                    floor: 1,
                    areaName: "绿野平原通道",
                    type: AreaType.安全区,
                    needLv: 1,
                    top: "新手村",
                    down: "绿野平原一"
                },
                "绿野平原一": {
                    floor: 1,
                    areaName: "绿野平原一",
                    type: AreaType.冒险区,
                    monster: [{ name: "小蜜蜂", lv: 1 }, { name: 'dora', lv: 2 }],
                    needLv: 1,
                    top: "绿野平原通道",
                    left: "绿野平原二",
                    right: "绿野平原三",
                    down: "绿野平原四"
                },
                "绿野平原二": {
                    floor: 1,
                    areaName: "绿野平原二",
                    type: AreaType.冒险区,
                    monster: [{ name: 'dora', lv: 2 }, { name: 'dora', lv: 2 }, { name: 'dora', lv: 3 }, { name: 'dora', lv: 2 }],
                    needLv: 1,
                    right: "绿野平原一",
                    down: "绿野平原五"
                },
                "绿野平原三": {
                    floor: 1,
                    areaName: "绿野平原三",
                    type: AreaType.冒险区,
                    monster: [{ name: 'dora', lv: 5 }],
                    needLv: 1,
                    left: "绿野平原一",
                    down: "绿野平原六"
                },
                "绿野平原四": {
                    floor: 1,
                    areaName: "绿野平原四",
                    type: AreaType.冒险区,
                    needLv: 1,
                    top: "绿野平原一",
                    down: "野猪巢穴",
                    monster: [{ name: '琪露诺', lv: 10 }]
                },
                "绿野平原六": {
                    floor: 1,
                    areaName: "绿野平原六",
                    type: AreaType.冒险区,
                    needLv: 1,
                    left: "绿野平原四",
                    top: "绿野平原三"
                },
                "野猪巢穴": {
                    floor: 1,
                    areaName: "野猪巢穴",
                    type: AreaType.BOSS区,
                    needLv: 1,
                    top: "绿野平原四",
                    monster: [{ name: '蓬莱山辉夜', lv: 20 }]
                }
            }
        }
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
                await session.send('当前移动冷却中，请稍等...')
                return
            }
            if (!(floor && areaName)) {
                await session.send('您当前位置有误，请使用(还没写好的指令)脱离卡死...')
                return
            }
            userCurrentArea.moveing = true
            const nowPosition = GensokyoMap.mapLocalData[floor][areaName]
            if (!nowPosition[type]) {
                await session.send('抱歉，此路不通！')
                userCurrentArea.moveing = false
                return
            }
            const newArea = GensokyoMap.mapLocalData[floor][nowPosition[type]]
            if (!newArea) {
                await session.send('进入失败，地图中不存在 ' + nowPosition[type] + ' 这个区域。')
                userCurrentArea.moveing = false
                return
            }
            if (newArea.type == AreaType.禁用) {
                await session.send(`该区域暂时未开放...`)
                userCurrentArea.moveing = false
                return
            }
            if (newArea.needLv > 1) {
                await session.send(`当前区域由于您的等级未达到最低要求，暂时无法进入。\n需要等级：${newArea.needLv}级`)
                userCurrentArea.moveing = false
                return
            }
            userCurrentArea.areaName = newArea.areaName
            const areaInfo = {
                user: { ...userCurrentArea },
                map: { ...newArea }
            }
            fn && await fn(areaInfo)
            await delay(3000)
            userCurrentArea.moveing = false
            GensokyoMap.setLocalStoragePoistionData(session.userId)
            return
        } catch (error) {
            console.log(error);
            if (GensokyoMap.userCurrentLoal?.[session.userId]) {
                GensokyoMap.userCurrentLoal[session.userId].moveing = false
            }
        }
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
    userAreaTextFormat(gameName: string, data: AreaCallbackData) {
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
        const str = `${gameName}[萌新] 当前位置：\n`
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
                `...等${liveUser.length}` : liveUser.join('、')}` : '')
        return str + mapInfo
    }
}