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
    giveMonetary: number,
    /** 概率获得道具 */
    giveProps?: {
        /** 道具名 */
        name: string,
        /** 获得概率 */
        radomVal: number,
        /** 最大获取数据 */
        val?: number,
        /** 掉落数量固定？ */
        const?: boolean,
        /** 怪物等级要求？ */
        lv?: number
    }[],
    fn?: {
        /** 技能名 */
        name: string,
        /** 触发概率 */
        prob: number
    }[]
    /** 被动技能 */
    passiveList?: string[]
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
        giveMonetary: 2,
        giveProps: [
            { name: '红药', val: 3, radomVal: 30 }
        ],
        fn: [{ name: '垂死挣扎', prob: 1 }],
        passiveList: []
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
        giveProps: [
            { name: '蓝药', val: 3, radomVal: 30 }
        ],
        passiveList: []
    },
    "dora": {
        name: "dora",
        type: MonsterOccupation.野怪,
        info: '偶尔出没在一层世界的奇怪生物',
        pic: "http://smmcat.cn/run/gensokyo/dora.png",
        hp: 88,
        maxHp: 88,
        mp: 30,
        maxMp: 30,
        atk: 20,
        def: 5,
        chr: 200,
        csr: 0,
        evasion: 200,
        hit: 1000,
        ghd: 1.2,
        speed: 4,
        giveExp: 15,
        giveMonetary: 3,
        giveProps: [
            { name: '蓝药', val: 3, radomVal: 30 },
            { name: '初级万能药', val: 2, radomVal: 90, const: true, lv: 5 }
        ],
        fn: [{ name: '治愈之光', prob: 1 }],
        passiveList: []
    },
    "琪露诺": {
        name: "琪露诺",
        type: MonsterOccupation.野怪,
        info: '常常被称呼笨蛋的冰之妖精，有时也被叫⑨',
        pic: "http://smmcat.cn/run/gensokyo/琪露诺.png",
        hp: 100,
        maxHp: 100,
        mp: 40,
        maxMp: 40,
        atk: 22,
        def: 5,
        chr: 100,
        csr: 0,
        evasion: 100,
        hit: 200,
        ghd: 1.2,
        speed: 4,
        giveExp: 15,
        giveMonetary: 3,
        passiveList: [],
        giveProps: [
            { name: '初级复活卷轴', val: 1, radomVal: 50 }
        ]
    },
    "大妖精": {
        name: "大妖精",
        type: MonsterOccupation.野怪,
        info: '活泼好动且喜欢搞恶作剧的妖怪，常常与琪露诺一起溜达',
        pic: "http://smmcat.cn/run/gensokyo/大妖精.png",
        hp: 120,
        maxHp: 120,
        mp: 40,
        maxMp: 40,
        atk: 18,
        def: 5,
        chr: 100,
        csr: 0,
        evasion: 100,
        hit: 600,
        ghd: 1.2,
        speed: 5,
        giveExp: 15,
        giveMonetary: 3,
        passiveList: [],
        giveProps: [
            { name: '初级复活卷轴', val: 1, radomVal: 50 }
        ]
    },
    "蓬莱山辉夜": {
        name: "蓬莱山辉夜",
        type: MonsterOccupation.野怪,
        info: '永远与须臾的公主,隐居于永远亭的辉夜姬。 对于拥有无限光阴的蓬莱人而言,过去与未来都是无穷无尽的。',
        pic: "http://smmcat.cn/run/gensokyo/蓬莱山辉夜.png",
        hp: 120,
        maxHp: 120,
        mp: 70,
        maxMp: 70,
        atk: 26,
        def: 2,
        chr: 100,
        csr: 0,
        evasion: 200,
        hit: 1100,
        ghd: 1.5,
        speed: 6,
        giveExp: 20,
        giveMonetary: 5,
        passiveList: [],
        giveProps: [
            { name: '初级复活卷轴', val: 1, radomVal: 50 }
        ],
        fn: [{ name: '初级治愈', prob: 3 }, { name: '水炮', prob: 1 }]
    },
    "绿毒蛇": {
        name: "绿毒蛇",
        type: MonsterOccupation.野怪,
        info: '尖利的毒牙是它有利的武器，使用毒之牙技能造成群体伤害。',
        pic: "http://smmcat.cn/run/gensokyo/绿毒蛇.png",
        hp: 70,
        maxHp: 70,
        mp: 60,
        maxMp: 60,
        atk: 21,
        def: 2,
        chr: 120,
        csr: 0,
        evasion: 100,
        hit: 1030,
        ghd: 1.6,
        speed: 5,
        giveExp: 16,
        giveMonetary: 5,
        passiveList: ['剧毒'],
        giveProps: [
            { name: '初级复活卷轴', val: 1, radomVal: 50 }
        ],
        fn: [{ name: '毒之牙', prob: 1 }]
    },
    "古明地觉": {
        name: "古明地觉",
        type: MonsterOccupation.BOSS,
        info: '位于旧地狱中心地带的管理者，拥有读心的控制技能。',
        pic: "http://smmcat.cn/run/gensokyo/古明地觉.png",
        hp: 95,
        maxHp: 95,
        mp: 140,
        maxMp: 140,
        atk: 24,
        def: 2,
        chr: 150,
        csr: 0,
        evasion: 150,
        hit: 1300,
        ghd: 1.6,
        speed: 8,
        giveExp: 20,
        giveMonetary: 8,
        passiveList: [],
        giveProps: [
            { name: '初级复活卷轴', val: 1, radomVal: 50 }
        ],
        fn: [{ name: '恐怖催眠术', prob: 1 }, { name: "恐怖的回忆", prob: 2 }]
    },
    "古明地恋": {
        name: "古明地恋",
        type: MonsterOccupation.BOSS,
        info: '她与觉一样拥有读心术,但她知道人们讨厌这种能力,因此将能读心的第三只眼紧闭着',
        pic: "http://smmcat.cn/run/gensokyo/古明地恋.png",
        hp: 135,
        maxHp: 135,
        mp: 140,
        maxMp: 140,
        atk: 5,
        def: 2,
        chr: 150,
        csr: 0,
        evasion: 200,
        hit: 1300,
        ghd: 1.6,
        speed: 8,
        giveExp: 20,
        giveMonetary: 8,
        passiveList: ['反伤'],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 50 }
        ],
        fn: [{ name: '紧闭的恋之瞳', prob: 3 }, { name: "初级驱散", prob: 1 }, { name: '无意识行动', prob: 2 }]
    },
    "白洲梓": {
        name: "白洲梓",
        type: MonsterOccupation.野怪,
        info: '基沃托斯中圣三一综合学园所属，补习部的冰之魔女。',
        pic: "http://smmcat.cn/run/gensokyo/白洲梓.png",
        hp: 100,
        maxHp: 100,
        mp: 70,
        maxMp: 70,
        atk: 20,
        def: 2,
        chr: 150,
        csr: 0,
        evasion: 100,
        hit: 1100,
        ghd: 1.3,
        speed: 5,
        giveExp: 16,
        giveMonetary: 3,
        passiveList: ['针女'],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 20 }, { name: '初级复活卷轴', val: 1, radomVal: 50 }
        ],
        fn: [{ name: '瓦尼瓦尼', prob: 1 }]
    }
}