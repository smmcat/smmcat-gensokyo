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
            { name: '初级万能药', val: 2, radomVal: 10, const: true, lv: 5 },
            { name: '技能书-治愈之光', val: 1, radomVal: 10 },
            { name: '新手装备礼盒', val: 1, radomVal: 30 }
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
            { name: '初级复活卷轴', val: 1, radomVal: 30 },
            { name: '新手装备礼盒', val: 1, radomVal: 50 }
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
            { name: '初级复活卷轴', val: 1, radomVal: 30 },
            { name: '新手装备礼盒', val: 1, radomVal: 60 }
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
            { name: '初级复活卷轴', val: 1, radomVal: 30 },
            { name: '新手装备礼盒', val: 2, radomVal: 70 }
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
            { name: '初级复活卷轴', val: 1, radomVal: 30 }, { name: '技能书-毒之牙', val: 1, radomVal: 10 },
            { name: '新手装备礼盒', val: 1, radomVal: 70 }
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
            { name: '初级复活卷轴', val: 1, radomVal: 20 }, { name: '技能书-恐怖催眠术', val: 1, radomVal: 10 },
            { name: '新手装备礼盒', val: 2, radomVal: 70 }
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
            { name: '大红药', val: 2, radomVal: 50 }, { name: '技能书-初级驱散', val: 1, radomVal: 10 },
            { name: '新手装备礼盒', val: 1, radomVal: 30 }
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
            { name: '大红药', val: 2, radomVal: 20 }, { name: '初级复活卷轴', val: 1, radomVal: 50 },
            { name: '新手装备礼盒', val: 1, radomVal: 30 }
        ],
        fn: [{ name: '瓦尼瓦尼', prob: 1 }]
    },
    "星见雅": {
        name: "星见雅",
        type: MonsterOccupation.野怪,
        info: '星见雅，对空洞事务特别行动部第六课课长，同时也是史上最年轻的“虚狩”。',
        pic: "http://smmcat.cn/run/gensokyo/星见雅.png",
        hp: 100,
        maxHp: 100,
        mp: 110,
        maxMp: 110,
        atk: 24,
        def: 3,
        chr: 150,
        csr: 0,
        evasion: 100,
        hit: 1150,
        ghd: 1.5,
        speed: 6,
        giveExp: 22,
        giveMonetary: 3,
        passiveList: ['霜灼破', '伤魂鸟'],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 20 },
            { name: '中级复活卷轴', val: 1, radomVal: 50 },
            { name: '技能书-飞雪', val: 1, radomVal: 10 },
            { name: '技能书-霜月架势', val: 1, radomVal: 10 },
            { name: '新手装备礼盒', val: 3, radomVal: 80 }
        ],
        fn: [{ name: '飞雪', prob: 3 }, { name: '霜月架势', prob: 1 }]
    },
    "kemomimi": {
        name: "kemomimi",
        type: MonsterOccupation.野怪,
        info: '小小的狐狸，可可爱爱，梦想是来一场说走就走的单程票，整日整夜就想跟对面爆了',
        pic: "http://smmcat.cn/run/gensokyo/kemomimi.png",
        hp: 70,
        maxHp: 70,
        mp: 80,
        maxMp: 80,
        atk: 23,
        def: 5,
        chr: 150,
        csr: 0,
        evasion: 100,
        hit: 1200,
        ghd: 1.5,
        speed: 5,
        giveExp: 12,
        giveMonetary: 1,
        passiveList: [],
        giveProps: [],
        fn: [{ name: "跟你爆了", prob: 1 }]
    },
    "菲比啾比": {
        name: "菲比啾比",
        type: MonsterOccupation.野怪,
        info: '从二创来的白丝魅魔，精力旺盛，已经成为某个时代的梗图之王。与弗糯糯两人组成"没头脑+不高兴"组合',
        pic: "http://smmcat.cn/run/gensokyo/菲比啾比.png",
        hp: 75,
        maxHp: 75,
        mp: 110,
        maxMp: 110,
        atk: 20,
        def: 6,
        chr: 170,
        csr: 10,
        evasion: 120,
        hit: 1000,
        ghd: 1.5,
        speed: 7,
        giveExp: 13,
        giveMonetary: 2,
        passiveList: ["心眼"],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 20 },
            { name: '中级复活卷轴', val: 1, radomVal: 50 }
        ],
        fn: [{ name: "夏弥尔之星", prob: 1 }, { name: '初级治愈', prob: 3 }]
    },
    "弗糯糯": {
        name: "弗糯糯",
        type: MonsterOccupation.野怪,
        info: '从二创来的爱哭背锅侠，总是被菲比欺负，性格内向。与菲比啾比两人组成"没头脑+不高兴"组合',
        pic: "http://smmcat.cn/run/gensokyo/弗糯糯.png",
        hp: 70,
        maxHp: 70,
        mp: 80,
        maxMp: 80,
        atk: 25,
        def: 5,
        chr: 150,
        csr: 10,
        evasion: 100,
        hit: 1500,
        ghd: 1.5,
        speed: 5,
        giveExp: 13,
        giveMonetary: 2,
        passiveList: ["破势"],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 20 },
            { name: '中级复活卷轴', val: 1, radomVal: 50 }
        ],
        fn: [{ name: "往日深渊的圆舞曲", prob: 1 }, { name: '初级治愈', prob: 3 }]
    },
    "雾灯巡卫": {
        name: "雾灯巡卫",
        type: MonsterOccupation.野怪,
        info: '兹穆弗特城外巡夜的卫兵，会借雾灯干扰目标视线。',
        pic: "http://smmcat.cn/run/gensokyo/雾灯巡卫.png",
        hp: 130,
        maxHp: 130,
        mp: 90,
        maxMp: 90,
        atk: 28,
        def: 8,
        chr: 130,
        csr: 20,
        evasion: 160,
        hit: 1250,
        ghd: 1.5,
        speed: 7,
        giveExp: 24,
        giveMonetary: 6,
        passiveList: [],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 25 },
            { name: '雾城装备礼盒', val: 1, radomVal: 12 }
        ],
        fn: [{ name: "雾灯刺击", prob: 2 }, { name: '初级治愈', prob: 1 }]
    },
    "街角魔偶": {
        name: "街角魔偶",
        type: MonsterOccupation.野怪,
        info: '被遗落在街角的魔法偶人，关节转动时会发出细碎的齿轮声。',
        pic: "http://smmcat.cn/run/gensokyo/街角魔偶.png",
        hp: 160,
        maxHp: 160,
        mp: 70,
        maxMp: 70,
        atk: 30,
        def: 12,
        chr: 110,
        csr: 30,
        evasion: 90,
        hit: 1180,
        ghd: 1.4,
        speed: 5,
        giveExp: 26,
        giveMonetary: 7,
        passiveList: ['恢复'],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 25 },
            { name: '雾城装备礼盒', val: 1, radomVal: 14 }
        ],
        fn: [{ name: "齿轮重碾", prob: 2 }]
    },
    "齿轮守墓人": {
        name: "齿轮守墓人",
        type: MonsterOccupation.野怪,
        info: '守在雾城旧墓边缘的机关人，沉默地记录来访者的脚步。',
        pic: "http://smmcat.cn/run/gensokyo/齿轮守墓人.png",
        hp: 175,
        maxHp: 175,
        mp: 100,
        maxMp: 100,
        atk: 34,
        def: 14,
        chr: 140,
        csr: 30,
        evasion: 110,
        hit: 1280,
        ghd: 1.5,
        speed: 6,
        giveExp: 28,
        giveMonetary: 8,
        passiveList: ['反伤'],
        giveProps: [
            { name: '中级复活卷轴', val: 1, radomVal: 18 },
            { name: '雾城装备礼盒', val: 1, radomVal: 16 }
        ],
        fn: [{ name: "墓钟回响", prob: 2 }]
    },
    "雨巷妖精": {
        name: "雨巷妖精",
        type: MonsterOccupation.野怪,
        info: '喜欢在屋檐水声中穿行的妖精，轻盈得像一阵冷雨。',
        pic: "http://smmcat.cn/run/gensokyo/雨巷妖精.png",
        hp: 120,
        maxHp: 120,
        mp: 120,
        maxMp: 120,
        atk: 32,
        def: 7,
        chr: 160,
        csr: 10,
        evasion: 220,
        hit: 1220,
        ghd: 1.6,
        speed: 9,
        giveExp: 27,
        giveMonetary: 7,
        passiveList: ['心眼'],
        giveProps: [
            { name: '大红药', val: 2, radomVal: 25 },
            { name: '雾城装备礼盒', val: 1, radomVal: 14 }
        ],
        fn: [{ name: "雨巷急袭", prob: 2 }, { name: '治愈之光', prob: 1 }]
    },
    "兹穆弗特钟卫": {
        name: "兹穆弗特钟卫",
        type: MonsterOccupation.BOSS,
        info: '雾钟塔最顶端的守卫，钟声响起时整座城市都会短暂静止。',
        pic: "http://smmcat.cn/run/gensokyo/兹穆弗特钟卫.png",
        hp: 210,
        maxHp: 210,
        mp: 160,
        maxMp: 160,
        atk: 38,
        def: 16,
        chr: 160,
        csr: 40,
        evasion: 150,
        hit: 1350,
        ghd: 1.7,
        speed: 8,
        giveExp: 40,
        giveMonetary: 14,
        passiveList: ['反伤'],
        giveProps: [
            { name: '中级复活卷轴', val: 1, radomVal: 30 },
            { name: '雾城装备礼盒', val: 2, radomVal: 70 }
        ],
        fn: [{ name: "雾钟审判", prob: 3 }, { name: "墓钟回响", prob: 1 }]
    },
    "月湾水灵": {
        name: "月湾水灵",
        type: MonsterOccupation.野怪,
        info: '月影港浅滩上凝聚出的水灵，身体里流动着潮汐的光。',
        pic: "http://smmcat.cn/run/gensokyo/月湾水灵.png",
        hp: 170,
        maxHp: 170,
        mp: 150,
        maxMp: 150,
        atk: 36,
        def: 10,
        chr: 130,
        csr: 20,
        evasion: 180,
        hit: 1320,
        ghd: 1.5,
        speed: 8,
        giveExp: 34,
        giveMonetary: 10,
        passiveList: [],
        giveProps: [
            { name: '大红药', val: 3, radomVal: 30 },
            { name: '月潮装备礼盒', val: 1, radomVal: 14 }
        ],
        fn: [{ name: "月湾涌流", prob: 2 }, { name: "初级治愈", prob: 1 }]
    },
    "潮汐歌姬": {
        name: "潮汐歌姬",
        type: MonsterOccupation.野怪,
        info: '歌声会随着潮汐远近变化的妖怪，靠近时会让人短暂失神。',
        pic: "http://smmcat.cn/run/gensokyo/潮汐歌姬.png",
        hp: 150,
        maxHp: 150,
        mp: 180,
        maxMp: 180,
        atk: 35,
        def: 8,
        chr: 170,
        csr: 20,
        evasion: 200,
        hit: 1300,
        ghd: 1.6,
        speed: 9,
        giveExp: 35,
        giveMonetary: 10,
        passiveList: ['吸血'],
        giveProps: [
            { name: '大红药', val: 3, radomVal: 30 },
            { name: '月潮装备礼盒', val: 1, radomVal: 15 }
        ],
        fn: [{ name: "潮歌魅影", prob: 2 }, { name: "治愈之光", prob: 1 }]
    },
    "沉船骑士": {
        name: "沉船骑士",
        type: MonsterOccupation.野怪,
        info: '披着盐渍铁甲的骑士，仍固执守护早已沉没的船。',
        pic: "http://smmcat.cn/run/gensokyo/沉船骑士.png",
        hp: 230,
        maxHp: 230,
        mp: 120,
        maxMp: 120,
        atk: 42,
        def: 18,
        chr: 140,
        csr: 50,
        evasion: 100,
        hit: 1380,
        ghd: 1.6,
        speed: 6,
        giveExp: 38,
        giveMonetary: 12,
        passiveList: ['破势'],
        giveProps: [
            { name: '中级复活卷轴', val: 1, radomVal: 20 },
            { name: '月潮装备礼盒', val: 1, radomVal: 16 }
        ],
        fn: [{ name: "锈潮斩", prob: 2 }]
    },
    "月蚀灯守": {
        name: "月蚀灯守",
        type: MonsterOccupation.BOSS,
        info: '月蚀灯塔的守护者，会把敌人的影子拖进退潮后的黑暗里。',
        pic: "http://smmcat.cn/run/gensokyo/月蚀灯守.png",
        hp: 280,
        maxHp: 280,
        mp: 220,
        maxMp: 220,
        atk: 48,
        def: 20,
        chr: 180,
        csr: 60,
        evasion: 170,
        hit: 1450,
        ghd: 1.8,
        speed: 9,
        giveExp: 55,
        giveMonetary: 20,
        passiveList: ['伤魂鸟'],
        giveProps: [
            { name: '中级复活卷轴', val: 1, radomVal: 35 },
            { name: '月潮装备礼盒', val: 2, radomVal: 70 }
        ],
        fn: [{ name: "月蚀潮汐", prob: 3 }, { name: "潮歌魅影", prob: 1 }]
    },
    "星砂游魂": {
        name: "星砂游魂",
        type: MonsterOccupation.野怪,
        info: '飘荡在星砂外缘的游魂，行动轨迹像被风吹散的星尘。',
        pic: "http://smmcat.cn/run/gensokyo/星砂游魂.png",
        hp: 210,
        maxHp: 210,
        mp: 190,
        maxMp: 190,
        atk: 50,
        def: 14,
        chr: 190,
        csr: 40,
        evasion: 260,
        hit: 1480,
        ghd: 1.8,
        speed: 11,
        giveExp: 48,
        giveMonetary: 16,
        passiveList: ['心眼'],
        giveProps: [
            { name: '大红药', val: 4, radomVal: 35 },
            { name: '星砂装备礼盒', val: 1, radomVal: 14 }
        ],
        fn: [{ name: "星砂闪击", prob: 2 }, { name: "治愈之光", prob: 1 }]
    },
    "陨铁傀儡": {
        name: "陨铁傀儡",
        type: MonsterOccupation.野怪,
        info: '由陨铁铸成的傀儡，沉重的拳头会带着灼热星屑落下。',
        pic: "http://smmcat.cn/run/gensokyo/陨铁傀儡.png",
        hp: 320,
        maxHp: 320,
        mp: 140,
        maxMp: 140,
        atk: 56,
        def: 24,
        chr: 150,
        csr: 70,
        evasion: 110,
        hit: 1420,
        ghd: 1.7,
        speed: 6,
        giveExp: 52,
        giveMonetary: 18,
        passiveList: ['反伤'],
        giveProps: [
            { name: '中级复活卷轴', val: 1, radomVal: 22 },
            { name: '星砂装备礼盒', val: 1, radomVal: 16 }
        ],
        fn: [{ name: "陨铁坠击", prob: 2 }]
    },
    "星核祭司": {
        name: "星核祭司",
        type: MonsterOccupation.野怪,
        info: '在星核祭坛低声祈祷的祭司，能把魔力压成一束灼亮星光。',
        pic: "http://smmcat.cn/run/gensokyo/星核祭司.png",
        hp: 240,
        maxHp: 240,
        mp: 260,
        maxMp: 260,
        atk: 54,
        def: 16,
        chr: 210,
        csr: 50,
        evasion: 190,
        hit: 1520,
        ghd: 1.9,
        speed: 10,
        giveExp: 55,
        giveMonetary: 19,
        passiveList: ['吸血'],
        giveProps: [
            { name: '大红药', val: 4, radomVal: 35 },
            { name: '星砂装备礼盒', val: 1, radomVal: 18 }
        ],
        fn: [{ name: "星核灼光", prob: 2 }, { name: "初级治愈", prob: 1 }]
    },
    "坠星王": {
        name: "坠星王",
        type: MonsterOccupation.BOSS,
        info: '坠星王座上的古老意志，身披星砂与陨铁，等待下一次天坠。',
        pic: "http://smmcat.cn/run/gensokyo/坠星王.png",
        hp: 430,
        maxHp: 430,
        mp: 320,
        maxMp: 320,
        atk: 68,
        def: 28,
        chr: 240,
        csr: 80,
        evasion: 210,
        hit: 1600,
        ghd: 2,
        speed: 10,
        giveExp: 80,
        giveMonetary: 30,
        passiveList: ['伤魂鸟', '反伤'],
        giveProps: [
            { name: '中级复活卷轴', val: 1, radomVal: 45 },
            { name: '星砂装备礼盒', val: 2, radomVal: 80 }
        ],
        fn: [{ name: "坠星裁决", prob: 3 }, { name: "星核灼光", prob: 1 }]
    },
}
