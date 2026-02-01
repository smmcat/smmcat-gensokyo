import { Context, Session } from "koishi";
import { Config } from ".";
import { User, UserBaseAttribute } from "./users";
import { Equipment, equipmentData, SuitDict } from "./data/initEquipment";
import { BattleAttribute } from "./battle";

/**
 * 
 * 武器  主属性攻击
 * 护甲  主属性生命
 * 鞋子  主属性速度
 * 头盔  主属性命中&暴击抵抗
 * 项链  主属性暴击&爆伤
 * 裤子  主属性闪避&防御
 * 披风  主属性蓝量&伤害减免
 */

type UserEqItem = { fid: number, name: string, }


export const EquipmentKeys = {
    "武器": 'weapon',
    "头盔": 'helmet',
    "护甲": 'armor',
    "鞋子": 'shoes',
    "项链": 'necklace',
    "裤子": 'pants',
    "披风": 'cloak'
}

export const EquipmentValue = {
    'weapon': "武器",
    'helmet': "头盔",
    'armor': "护甲",
    'shoes': "鞋子",
    'necklace': "项链",
    'pants': "裤子",
    'cloak': "披风"
}

/** 用户装备属性 */
export type UserEquipmentItem = {
    /** 武器 */
    weapon: EquipmentDictDatabase,
    /** 头盔 */
    helmet: EquipmentDictDatabase,
    /** 护甲 */
    armor: EquipmentDictDatabase,
    /** 鞋子 */
    shoes: EquipmentDictDatabase,
    /** 项链 */
    necklace: EquipmentDictDatabase,
    /** 裤子 */
    pants: EquipmentDictDatabase,
    /** 披风 */
    cloak: EquipmentDictDatabase
}

/** 装备属性范围 */
export type SecAttrDict = {
    /** 最大血量 */
    maxHp?: number,
    /** 最大蓝量 */
    maxMp?: number,
    /** 攻击力 */
    atk?: number,
    /** 防御力 */
    def?: number,
    /** 暴击率 */
    chr?: number,
    /** 暴击伤害 */
    ghd?: number,
    /** 暴击抵抗 */
    csr?: number,
    /** 闪避值 */
    evasion?: number,
    /** 命中值 */
    hit?: number,
    /** 出手速度 */
    speed?: number
    /** 伤害减免 */
    reduction?: number
    /** 治疗加成 */
    TreatmentUp?: number
}

/** 装备属性文本信息字典 */
export const EquipmentAttrStringDict = {
    /** 最大血量 */
    maxHp: { name: '最大血量', up: 1 },
    /** 最大蓝量 */
    maxMp: { name: '最大蓝量', up: 1 },
    /** 攻击力 */
    atk: { name: '攻击力', up: 1 },
    /** 防御力 */
    def: { name: '防御力', up: 1 },
    /** 暴击率 */
    chr: { name: '暴击率', up: 1 },
    /** 暴击伤害 */
    ghd: { name: '暴击伤害', up: 1 },
    /** 暴击抵抗 */
    csr: { name: '暴击抵抗', up: 1 },
    /** 闪避值 */
    evasion: { name: '闪避值', up: 1 },
    /** 命中值 */
    hit: { name: '命中值', up: 1 },
    /** 出手速度 */
    speed: { name: '出手速度', up: 1 },
    /** 伤害减免 */
    reduction: { name: '伤害减免', up: 0.1 },
    /** 治疗加成 */
    TreatmentUp: { name: '治疗加成', up: 0.1 }
}
const equipment_secList = Object.keys(EquipmentAttrStringDict)

export type MainUpTypeDict = keyof SecAttrDict

/** 数据库装备属性 */
export type EquipmentDictDatabase = {
    /** 装备ID */
    fid?: number,
    /** 装备进阶等级 */
    forging: number,
    /** 增益的项目值 */
    forgingUp: SecAttrDict
    /** 装备来源 */
    userId: string,
    /** 装备类型 */
    type: Equipment,
    /** 装备名 */
    name: string,
    /** 耐久度 */
    durability: number,
    /** 主属性类型 */
    mainUpType: MainUpTypeDict,
    /** 主属性数值 */
    mainAttr: number,
    /** 副属性数值 */
    secAttr: SecAttrDict,
    /** 是否佩戴 */
    isUse: boolean
}


declare module 'koishi' {
    interface Tables {
        smm_gensokyo_equipme: EquipmentDictDatabase,
    }
}

export const UserEquipment = {
    config: {} as Config,
    ctx: {} as Context,
    userEquCurrentTemp: {} as { [keys: string]: UserEquipmentItem },
    userEquPropsTemp: {} as { [keys: string]: { [keys: string | number]: EquipmentDictDatabase } },
    async init(config: Config, ctx: Context) {
        this.config = config
        this.ctx = ctx;

        ctx.database.extend(
            'smm_gensokyo_equipme',
            {
                fid: 'integer',
                name: 'string',
                forging: 'integer',
                forgingUp: 'json',
                type: 'string',
                userId: 'string',
                isUse: 'boolean',
                durability: 'integer',
                mainUpType: 'string',
                mainAttr: 'integer',
                secAttr: 'json'
            },
            {
                primary: 'fid',
                autoInc: true
            }
        )

        const userList = Object.keys(User.userTempData)
        const eqipmentTemp = {}
        for (const userId of userList) {
            const eqipmentList = await ctx.database.get('smm_gensokyo_equipme', { userId })
            eqipmentTemp[userId] = {}
            UserEquipment.userEquCurrentTemp[userId] = {
                weapon: null,
                helmet: null,
                armor: null,
                shoes: null,
                necklace: null,
                pants: null,
                cloak: null
            }
            // 数据分配封装进缓存
            eqipmentList.forEach((item) => {
                eqipmentTemp[userId][item.fid] = item
                // 若装备为正在携带且为有效位置
                if (item.isUse && EquipmentKeys[item.type]) {
                    UserEquipment.userEquCurrentTemp[userId][EquipmentKeys[item.type]] = item
                }
            })
        }
        UserEquipment.userEquPropsTemp = eqipmentTemp
    },
    /** 获取指定装备 */
    async getEquipment(userId: string, equipment: { name: string }) {
        const equipmentType = equipmentData[equipment.name]
        if (!equipmentType) return

        // 随机获得一个副属性
        const upAttr = equipment_secList[Math.floor(equipment_secList.length * Math.random())]
        const secAttr = {}
        if (['maxHp', 'maxMp'].includes(upAttr)) {
            secAttr[upAttr] = Math.floor(10 * EquipmentAttrStringDict[upAttr].up * equipmentType.star)
        } else if (['evasion', 'hit', 'csr'].includes(upAttr)) {
            secAttr[upAttr] = Math.floor(5 * EquipmentAttrStringDict[upAttr].up * equipmentType.star)
        } else if (['chr', 'atk'].includes(upAttr)) {
            secAttr[upAttr] = Math.floor(3 * EquipmentAttrStringDict[upAttr].up * equipmentType.star)
        } else if (['ghd', 'TreatmentUp', 'reduction'].includes(upAttr)) {
            secAttr[upAttr] = parseFloat((0.05 * EquipmentAttrStringDict[upAttr].up * equipmentType.star).toFixed(2))
        } else {
            secAttr[upAttr] = Math.floor(EquipmentAttrStringDict[upAttr].up * equipmentType.star)
        }

        // 存储到数据库
        const result = await UserEquipment.ctx.database.create('smm_gensokyo_equipme', {
            userId,
            name: equipment.name,
            type: equipmentType.type,
            forging: 1,
            forgingUp: {},
            durability: 100,
            mainUpType: equipmentType.mainUpType,
            mainAttr: equipmentType.mainAttr,
            secAttr,
            isUse: false
        })
        if (!UserEquipment.userEquPropsTemp[userId]) {
            UserEquipment.userEquPropsTemp[userId] = {}
        }
        UserEquipment.userEquPropsTemp[userId][result.fid] = result
        return result
    },
    /** 获取用户装备列表 */
    async getUserEquipmentInfo(session: Session) {
        const { userId } = session;
        const myEquipment = UserEquipment.userEquPropsTemp[userId]
        const MyEquipmentList = Object.values(myEquipment) as EquipmentDictDatabase[]

        if (!MyEquipmentList.length) {
            await session.send('您并没有任何装备内容...')
            return
        }
        const pageSize = 10;
        const pages = Math.ceil(MyEquipmentList.length / pageSize)
        let currentPage = 0;

        while (true) {
            const currentList = MyEquipmentList.slice(currentPage * pageSize, pageSize + (currentPage * pageSize))
            await session.send(UserEquipment.forMatEquipmentListByText(currentList, currentPage, pages))
            const useType = await session.prompt(30000)
            if (useType == undefined) break;
            if (useType.trim() == '上页') {
                currentPage !== 0 && currentPage--
                continue;
            }
            if (useType.trim() == '下页') {
                currentPage < pageSize && currentPage++
                continue;
            }
            if (useType.trim().startsWith('跳页-')) {
                const c = useType.split('-')[1]
                if (isNaN(Number(c))) {
                    await session.send('输入有误，请重新输入')
                    continue;
                }
                currentPage = Math.floor(Math.abs(Number(c)))
                if (currentPage >= pages) {
                    currentPage = pages - 1
                }
                continue;
            }
            if (useType.trim() == '退出') {
                await session.send('已退出。')
                break;
            }
            await session.send('输入有误，请重新输入，若想退出查询，请发送退出！')
        }
    },
    /** 文本格式化输出装备列表 */
    forMatEquipmentListByText(eqipmentList: EquipmentDictDatabase[], currentPage: number, pages: number) {
        const msg = eqipmentList.map((item) => {
            return `[编号${item.fid}]lv.${item.forging}${item.name}\n   主属性：(${EquipmentAttrStringDict[item.mainUpType]?.name || '未知'}) +${item.mainAttr}` +
                `\n   副属性：${Object.keys(item.secAttr).map((sec) => {
                    return `(${EquipmentAttrStringDict[sec].name}) ${item.secAttr[sec]}`
                }).join('、')}`
        }).join('\n')
        return `第${currentPage + 1}/${pages}页，该页有${eqipmentList.length}个装备：\n\n${msg}\n\n可用指令：上页 下页 跳页-值 退出`
    },
    /** 为战斗属性添加装备加成 */
    setBattleDataUpByEquipmentAttr(anget: UserBaseAttribute) {
        if (!anget.userId) return
        const currentEquipment = UserEquipment.userEquCurrentTemp[anget.userId]
        const suitMap = {}
        const upVal = {} as SecAttrDict
        // 计算装备总增益值
        Object.values(currentEquipment).forEach((item) => {
            if (!item) return
            // 计算套装总数
            if (equipmentData[item.name]?.suit) {
                if (!suitMap[equipmentData[item.name].suit]) {
                    suitMap[equipmentData[item.name].suit] = 0
                }
                suitMap[equipmentData[item.name].suit]++
            }
            const upValItem = {}
            upValItem[item.mainUpType] = item.mainAttr + (item.secAttr[item.mainUpType] || 0)
            const lastUpVal = { ...item.secAttr, ...upValItem }
            // 单个装备添加最终属性值
            Object.keys(lastUpVal).forEach(i => {
                if (upVal[i] == undefined) {
                    upVal[i] = 0
                }
                upVal[i] += lastUpVal[i]
            })
        })
        anget.suitMap = suitMap
        anget.equipmentUpInfo = upVal
    },
    /** 战斗添加属性 */
    putBattleDataTo(upVal: SecAttrDict, anget: BattleAttribute) {
        Object.keys(upVal).forEach((item) => {
            // 已经直接赋值，无需额外结算
            if (['maxHp', 'maxMp'].includes(item)) return
            if (anget[item] == undefined) {
                anget[item] = 0
            }
            anget[item] += upVal[item]
        })
        // 判断套装并增加效果
        Object.keys(anget.suitMap).forEach((item) => {
            if (anget.suitMap[item] >= 2) {
                SuitDict[item].twoPiece(anget)
            }
            if (anget.suitMap[item] >= 4) {
                SuitDict[item].fourPiece(anget)
            }
        })
    },
    /** 同步数据库状态 */
    async updateEquipmentDatabaseData(equipment: EquipmentDictDatabase) {
        const copyEquipment = JSON.parse(JSON.stringify(equipment)) as EquipmentDictDatabase
        const { fid } = copyEquipment
        delete copyEquipment.fid
        await UserEquipment.ctx.database.set('smm_gensokyo_equipme', { fid }, copyEquipment)
    }
    /** 佩戴并替换选定的装备 */,
    async selectEquipmentFidToUse(session: Session, fid: number) {
        const { userId } = session
        const myEquipmentData = UserEquipment.userEquPropsTemp[userId]
        const myCurrentEquData = UserEquipment.userEquCurrentTemp[userId]
        const selectEqu = myEquipmentData[fid]
        let changeMsg = ''

        if (!selectEqu) {
            await session.send('没有在背包找到该编号的装备信息。')
            return
        }

        // 记录增益值
        const upInfo = { ...selectEqu.secAttr }
        if (!upInfo[selectEqu.mainUpType]) upInfo[selectEqu.mainUpType] = 0
        upInfo[selectEqu.mainUpType] += selectEqu.mainAttr

        const where = EquipmentKeys[selectEqu.type] as keyof UserEquipmentItem
        if (myCurrentEquData[where]) {
            if (myCurrentEquData[where].fid == fid) {
                await session.send(`当前编号下对应的${selectEqu.type}与目前已装备的${selectEqu.type}一致，无需修改。`)
                return
            }
            const beforEquipment = myCurrentEquData[where]
            beforEquipment.isUse = false
            await UserEquipment.updateEquipmentDatabaseData(beforEquipment)
            changeMsg = `，并卸下旧的装备[编号:${beforEquipment.fid}]lv.${beforEquipment.forging} ${beforEquipment.name}。`

            // 记录减益值
            const lostInfo = { ...beforEquipment.secAttr }
            if (!lostInfo[beforEquipment.mainUpType]) lostInfo[selectEqu.mainUpType] = 0
            lostInfo[beforEquipment.mainUpType] += beforEquipment.mainAttr

            // 结算总的增益
            Object.keys(lostInfo).forEach((item) => {
                if (!upInfo[item]) upInfo[item] = 0
                upInfo[item] -= lostInfo[item]
            })
        }
        selectEqu.isUse = true
        myCurrentEquData[where] = selectEqu
        const upMsg = Object.keys(upInfo).map((item) => {
            if (upInfo[item] == 0) return null
            const attrName = EquipmentAttrStringDict[item]?.name || '未知属性'
            return `[${attrName}]${upInfo[item] >= 0 ? '↑' : '↓'} ${Math.abs(upInfo[item])}`
        }).filter(i => i).join('\n')
        await UserEquipment.updateEquipmentDatabaseData(selectEqu)
        await session.send(`佩戴成功！已装备到${selectEqu.type}位置` + changeMsg + (upMsg ? `\n\n${upMsg}` : ''))
    },
    /** 装备卸载 */
    async unloadEquipment(session: Session, where: keyof UserEquipmentItem) {
        const { userId } = session
        const myCurrentEquData = UserEquipment.userEquCurrentTemp[userId]
        const selectEquipment = myCurrentEquData[where]

        if (!selectEquipment) {
            await session.send(`您并没有佩戴任何${EquipmentAttrStringDict[selectEquipment.type]?.name}类型的装备。`)
            return
        }
        selectEquipment.isUse = false
        const lostVal = { ...selectEquipment.secAttr }
        if (!lostVal[selectEquipment.mainUpType]) {
            lostVal[selectEquipment.mainUpType] = 0
        }
        lostVal[selectEquipment.mainUpType] += selectEquipment.mainAttr

        const msg = `卸下${selectEquipment.name}[${selectEquipment.fid}]成功！\n\n${Object.keys(lostVal).map((item) => {
            return `${EquipmentAttrStringDict[item].name} ↓${lostVal[item]}`
        }).join('\n')}`
        await UserEquipment.updateEquipmentDatabaseData(selectEquipment)
        myCurrentEquData[where] = null
        await session.send(msg)
    },
    /** 装备销毁 */
    async destroyEquipment(session: Session, fid: number) {
        const { userId } = session
        // 确认是否持有该装备
        if (!UserEquipment.userEquPropsTemp[userId][fid]) {
            await session.send(`没有找到编号为${fid}下的装备信息。`)
            return
        }
        // 确认是否佩戴中
        const myCurrentEquData = UserEquipment.userEquCurrentTemp[userId]
        const selectEquipment = Object.keys(myCurrentEquData).find((item) => {
            return myCurrentEquData[item] && (myCurrentEquData[item] as EquipmentDictDatabase).fid == fid
        }) as keyof UserEquipmentItem
        const msgs = []
        if (selectEquipment) {
            UserEquipment.unloadEquipment(session, selectEquipment)
            await session.send(`检测到您需要销毁的${myCurrentEquData[selectEquipment].name}[${myCurrentEquData[selectEquipment].fid}]已佩戴，是否卸下并删除？（30s回复 是）`)
            const result = await session.prompt(30000)
            if (result == undefined || result !== '是') return
            msgs.push(`已卸下${EquipmentAttrStringDict[selectEquipment]?.name}部位的装备。`)
        }
        // 执行删除策略
        delete UserEquipment.userEquPropsTemp[userId][fid]
        await UserEquipment.ctx.database.remove('smm_gensokyo_equipme', { fid })
        console.log('销毁成功！' + msgs.join('\n'));

        await session.send('销毁成功！' + msgs.join('\n'))
    },
    /** 通过 Fid 查询装备信息 */
    async getEquipmentDetailByFid(session: Session, fid: number) {
        const [equipment] = await UserEquipment.ctx.database.get('smm_gensokyo_equipme', { fid })
        if (!equipment) {
            await session.send(`没有找到对应编号为${fid} 装备信息`)
            return
        }
        const msg = `获取装备信息成功，内容如下：\n\n` +
            `【装备名】${equipment.name}\n` +
            `【所有者】${User.getUserName(equipment.userId)}\n` +
            `【装备品质】${Array.from({ length: equipmentData[equipment.name].star }, () => '⭐')}\n` +
            `【装备编号】${equipment.fid}\n` +
            `【装备类型】${equipment.type}\n` +
            `【套装类型】${equipmentData[equipment.name].suit}\n` +
            `【现耐久度】${equipment.durability}/100\n` +
            `【主属性值】${EquipmentAttrStringDict[equipment.mainUpType].name}+${equipment.mainAttr}\n` +
            `【副属性值】${Object.keys(equipment.secAttr).map((item) => {
                return `${EquipmentAttrStringDict[item].name}+${equipment.secAttr[item]}`
            }).join('、')}\n\n` +
            `${equipmentData[equipment.name].info}`
        await session.send(msg)
    }
}
