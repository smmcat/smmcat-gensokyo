import { Context, h, Session } from "koishi";
import { Config } from ".";
import { MonsterBaseAttribute, monsterData, MonsterOccupation, MonsterTempData } from "./data/initMonster";
import { monsterBenchmark } from "./data/benchmark";


declare module 'koishi' {
    interface Tables {
        smm_gensokyo_monster_attribute: MonsterBaseAttribute
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
        return monsterData as MonsterTempData
    },
    getMonsterAttributeData(monsterName: string, lv: number) {
        const monster = Monster.monsterTempData[monsterName]
        if (!monster) return null
        const temp = { lv } as MonsterBaseAttribute & { lv: number }
        // 选择等级配置
        const lvScope = Object.keys(monsterBenchmark).reverse().find((item) => Number(item) < lv) || 10
        const useBenchmark = monsterBenchmark[lvScope]
        console.log(useBenchmark);

        // 赋予等级叠加后的属性
        Object.keys(monster).forEach((i) => {
            temp[i] = monster[i]
            if (useBenchmark[i]) {
                const upVal = Math.floor((temp[i] * (useBenchmark[i] - 1) * (lv - 1)))
                if (upVal > 0) {
                    temp[i] += upVal
                } else {
                    // 特殊对待的值
                    switch (i) {
                        case 'hit':
                            temp[i] += 20 * (lv - 1)
                            break;
                        default:
                            break;
                    }
                }
            }
        })
        return temp
    },
    /** 格式化怪物属性数据 */
    monsterAttributeTextFormat(monster: MonsterBaseAttribute & { lv: number }) {
        const { name, type, lv, hp, maxHp, mp, maxMp, atk, def, chr, evasion, hit, ghd, speed, info, pic, giveProps } = monster
        const propsList = giveProps
            .filter((item) => item.lv ? lv >= item.lv : true)
            .map(item => item.name)

        const attributeText = (pic ? h.image(pic) + '\n' : '') +
            `Lv.${lv}【${name}】\n\n` +
            `【怪物类型】${type}\n` +
            `【生命值】${hp}/${maxHp}\n` +
            `【魔法值】${mp}/${maxMp}\n` +
            `【攻击力】${atk}\n` +
            `【防御力】${def}\n` +
            `【闪避值】${evasion}\n` +
            `【速度值】${speed}\n` +
            `【命中率】${(hit / 10 + 100).toFixed(1)}%\n` +
            `【暴击率】${(chr / 10).toFixed(1)}%\n` +
            `【爆伤倍率】${(ghd * 100).toFixed(0)}%` +
            (propsList?.length ? `\n【概率掉落道具】` + propsList.join('、') : '') +
            (info ? '\n\n' + info : '')
        return attributeText
    }
}