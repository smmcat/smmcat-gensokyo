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
        const temp = { lv, ...monster } as MonsterBaseAttribute & { lv: number }

        // 如果等级为1，直接返回初始属性
        if (lv <= 1) {
            return temp;
        }

        // 定义等级阶段和对应的基准
        const levelStages = [
            { maxLevel: 10, benchmark: monsterBenchmark[10] },
            { maxLevel: 20, benchmark: monsterBenchmark[20] },
            { maxLevel: Infinity, benchmark: monsterBenchmark[40] }
        ];

        // 从2级开始累乘计算
        for (let level = 2; level <= lv; level++) {
            // 确定当前等级使用的基准
            let currentBenchmark = null;
            for (const stage of levelStages) {
                if (level <= stage.maxLevel) {
                    currentBenchmark = stage.benchmark;
                    break;
                }
            }
            if (!currentBenchmark) continue;

            // 应用属性累乘增长
            temp.maxHp *= currentBenchmark.maxHp;
            temp.maxMp *= currentBenchmark.maxMp;
            temp.atk *= currentBenchmark.atk;
            temp.def *= currentBenchmark.def;
            temp.chr *= currentBenchmark.chr;
            temp.evasion *= currentBenchmark.evasion;
            temp.hit *= currentBenchmark.hit;
            temp.ghd *= currentBenchmark.ghd;
            temp.speed *= currentBenchmark.speed;
        }

        // 确保当前HP和MP不超过最大值
        temp.hp = Math.floor(temp.maxHp);
        temp.mp = Math.floor(temp.maxMp);
        temp.maxHp = Math.floor(temp.maxHp);
        temp.maxMp = Math.floor(temp.maxMp);
        temp.atk = Math.floor(temp.atk);
        temp.def = Math.floor(temp.def);
        temp.chr = Math.floor(temp.chr);
        temp.evasion = Math.floor(temp.evasion);
        temp.hit = Math.floor(temp.hit);
        temp.ghd = parseFloat(temp.ghd.toFixed(1));
        temp.speed = Math.round(temp.speed);

        return temp;
    },
    /** 格式化怪物属性数据 */
    monsterAttributeTextFormat(monster: MonsterBaseAttribute & { lv: number }) {
        const { name, type, lv, hp, maxHp, mp, maxMp, atk, def, chr, evasion, hit, ghd, speed, info, pic, giveProps, passiveList } = monster
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
            `【命中率】${(100 + (hit - 1000) / 10).toFixed(1)}%\n` +
            `【暴击率】${(chr / 10).toFixed(1)}%\n` +
            `【爆伤倍率】${(ghd * 100).toFixed(0)}%` +
            (passiveList.length ? `\n【被动技能】${passiveList.join('、')}` : '') +
            (propsList?.length ? `\n【概率掉落道具】` + propsList.join('、') : '') +
            (info ? '\n\n' + info : '')
        return attributeText
    }
}