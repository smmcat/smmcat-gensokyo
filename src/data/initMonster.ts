/**
 * 默认怪物集群
 */

/** 怪物基础属性 */
export type MonsterBaseAttribute = {
    /** 凭据ID */
    id?: number,
    /** 怪物名称 */
    name: string,
    /** 怪物说明 */
    info?: string,
    /** 怪物配图 */
    pic?: string,
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
    /** 暴击抵抗 */
    csr: number,
    /** 闪避值 */
    evasion: number,
    /** 命中值 */
    hit: number,
    /** 出手速度 */
    speed: number
    /** 获得经验 */
    giveExp: number,
    /** 获得货币 */
    giveMonetary: number
}

export type MonsterTempData = {
    [keys: string]: MonsterBaseAttribute
}

export enum MonsterOccupation {
    野怪 = "野怪",
    BOSS = "BOSS"
}
export const monsterData: MonsterTempData = {
    "小蜜蜂": {
        name: "小蜜蜂",
        type: MonsterOccupation.野怪,
        info: '幻想乡一层常见的生物',
        pic: "http://smmcat.cn/run/gensokyo/小蜜蜂.png",
        hp: 50,
        maxHp: 50,
        mp: 30,
        maxMp: 30,
        atk: 7,
        def: 2,
        chr: 50,
        csr: 0,
        evasion: 100,
        hit: 1000,
        ghd: 1.2,
        speed: 4,
        giveExp: 10,
        giveMonetary: 2
    },
    "小蜘蛛": {
        name: "小蜘蛛",
        type: MonsterOccupation.野怪,
        info: '幻想乡一层常见的生物',
        pic: "http://smmcat.cn/run/gensokyo/小蜘蛛.png",
        hp: 55,
        maxHp: 55,
        mp: 30,
        maxMp: 30,
        atk: 10,
        def: 3,
        chr: 50,
        csr: 0,
        evasion: 150,
        hit: 1000,
        ghd: 1.2,
        speed: 4,
        giveExp: 12,
        giveMonetary: 2,
    },
    "dora": {
        name: "dora",
        type: MonsterOccupation.野怪,
        info: '偶尔出没在一层世界的奇怪生物',
        pic: "http://smmcat.cn/run/gensokyo/dora.png",
        hp: 88,
        maxHp: 88,
        mp: 10,
        maxMp: 10,
        atk: 20,
        def: 5,
        chr: 200,
        csr: 0,
        evasion: 200,
        hit: 1000,
        ghd: 1.2,
        speed: 4,
        giveExp: 15,
        giveMonetary: 3
    }
}