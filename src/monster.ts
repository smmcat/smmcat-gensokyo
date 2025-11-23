import { Context, Session } from "koishi";
import { Config } from ".";


declare module 'koishi' {
    interface Tables {
        smm_gensokyo_monster_attribute: MonsterBaseAttribute
    }
}

export enum MonsterOccupation {
    野怪 = "野怪",
    BOSS = "BOSS"
}

/** 怪物基础属性 */
export type MonsterBaseAttribute = {
    /** 凭据ID */
    id?: number,
    /** 怪物名称 */
    name: string,
    /** 怪物说明 */
    info?: string,
    /** 类型 */
    type: MonsterOccupation,
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
    /** 暴击伤害 */
    ghd: number,
    /** 闪避值 */
    evasion: number,
    /** 命中值 */
    hit: number,
    /** 出手速度 */
    speed: number
}

type MonsterTempData = {
    [keys: string]: MonsterBaseAttribute
}

/** 怪物等级增益算法 */
type MonsterBenchmark = {
    [keys: number | string]: {
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

export const Monster = {
    config: {} as Config,
    ctx: {} as Context,
    monsterTempData: {} as MonsterTempData,
    async init(config: Config, ctx: Context) {
        Monster.config = config;
        Monster.ctx = ctx;
        // 创建数据库表结构
        ctx.model.extend(
            'smm_gensokyo_monster_attribute',
            {
                id: 'integer',
                name: 'string',
                info: 'string',
                type: 'string',
                hp: 'integer',
                maxHp: 'integer',
                mp: 'integer',
                maxMp: 'integer',
                atk: 'integer',
                def: 'integer',
                chr: 'integer',
                evasion: 'integer',
                hit: 'integer',
                ghd: 'integer',
                speed: 'integer'
            },
            {
                primary: 'id',
                autoInc: false
            }
        )
        // 预缓存
        const monsterData = await ctx.database.get('smm_gensokyo_monster_attribute', {})
        if (monsterData.length == 0) {
            Monster.monsterTempData = Monster._createInitMonsterData()
        } else {
            const temp = {} as MonsterTempData
            monsterData.forEach((item) => {
                temp[item.id] = item
            })
            Monster.monsterTempData = temp
        }
    },
    /** 赋予原始的怪物数据 */
    _createInitMonsterData() {
        const monsterData = {
            "小蜜蜂": {
                name: "小蜜蜂",
                type: MonsterOccupation.野怪,
                info: '幻想乡一层常见的生物',
                hp: 50,
                maxHp: 50,
                mp: 30,
                maxMp: 30,
                atk: 7,
                def: 2,
                chr: 50,
                evasion: 100,
                hit: 1000,
                ghd: 1.2,
                speed: 4
            },
            "小蜘蛛": {
                name: "小蜘蛛",
                type: MonsterOccupation.野怪,
                info: '幻想乡一层常见的生物',
                hp: 55,
                maxHp: 55,
                mp: 30,
                maxMp: 30,
                atk: 10,
                def: 3,
                chr: 50,
                evasion: 200,
                hit: 1000,
                ghd: 1.2,
                speed: 4
            },
            "dora": {
                name: "dora",
                type: MonsterOccupation.野怪,
                info: '偶尔出没在一层世界的奇怪生物',
                hp: 88,
                maxHp: 88,
                mp: 10,
                maxMp: 10,
                atk: 20,
                def: 5,
                chr: 200,
                evasion: 300,
                hit: 1000,
                ghd: 1.2,
                speed: 4
            }
        } as MonsterTempData
        return monsterData
    },
    getMonsterAttributeData(monsterName: string, lv: number) {
        const monster = Monster.monsterTempData[monsterName]
        if (!monster) return null

        const benchmark = {
            10: {
                hp: 1.4,
                maxHp: 1.4,
                mp: 1.2,
                maxMp: 1.2,
                atk: 1.2,
                def: 1.1,
                chr: 1.1,
                evasion: 1.2,
                hit: 1.2,
                ghd: 1.0,
                speed: 1.05
            },
            20: {
                hp: 1.35,
                maxHp: 1.35,
                mp: 1.1,
                maxMp: 1.1,
                atk: 1.1,
                def: 1.1,
                chr: 1.1,
                evasion: 1.1,
                hit: 1.1,
                ghd: 1.0,
                speed: 1.05
            },
            40: {
                hp: 1.2,
                maxHp: 1.2,
                mp: 1.05,
                maxMp: 1.05,
                atk: 1.1,
                def: 1.05,
                chr: 1.05,
                evasion: 1.05,
                hit: 1.05,
                ghd: 1.05,
                speed: 1.05
            }
        } as MonsterBenchmark
        const temp = { lv } as MonsterBaseAttribute & { lv: number }

        // 选择等级配置
        const lvScope = Object.keys(benchmark).reverse().find((item) => Number(item) < lv) || 10
        const useBenchmark = benchmark[lvScope]
        console.log(useBenchmark);

        // 赋予等级叠加后的属性
        Object.keys(monster).forEach((i) => {
            temp[i] = monster[i]
            if (useBenchmark[i]) {
                temp[i] += Math.floor((temp[i] * (useBenchmark[i] - 1) * (lv - 1)))
            }
        })
        return temp
    },
    /** 格式化怪物属性数据 */
    monsterAttributeTextFormat(monster: MonsterBaseAttribute & { lv: number }) {
        const { name, type, lv, hp, maxHp, mp, maxMp, atk, def, chr, evasion, hit, ghd, speed, info } = monster
        const attributeText = `Lv.${lv}【${name}】\n\n` +
            `【怪物类型】${type}\n` +
            `【生命值】${hp}/${maxHp}\n` +
            `【魔法值】${mp}/${maxMp}\n` +
            `【攻击力】${atk}\n` +
            `【防御力】${def}\n` +
            `【闪避值】${evasion}\n` +
            `【命中值】${hit}\n` +
            `【速度值】${speed}\n` +
            `【暴击率】${(chr / 10).toFixed(1)}%\n` +
            `【爆伤倍率】${(ghd * 100).toFixed(0)}%` +
            (info ? '\n\n' + info : '')
        return attributeText
    }
}