import { BaseAreaData } from "../map";

/** 区域类型枚举 */
export enum AreaType {
    安全区 = "安全区", 冒险区 = "冒险区", 商店 = "商店", 地牢 = "地牢", 传送门 = "传送门", 禁用 = "禁用", BOSS区 = "BOSS区", 银行 = "银行"
}

export const BseMap: BaseAreaData = {
    1: {
        "地下墓穴": {
            floor: 1,
            areaName: "地下墓穴",
            type: AreaType.BOSS区,
            needLv: 10,
            down: "蜘蛛洞穴",
            monster: [{ name: "古明地觉", lv: 15 }]
        },
        "蜘蛛洞穴": {
            floor: 1,
            areaName: "蜘蛛洞穴",
            type: AreaType.冒险区,
            needLv: 1,
            top: "地下墓穴",
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
            type: AreaType.银行,
            needLv: 1,
            down: "1层-商店",
            left: "中央广场"
        },
        "1层-商店": {
            floor: 1,
            areaName: "1层-商店",
            type: AreaType.安全区,
            needLv: 1,
            top: "银行",
            right: "农田",
            left: "新手村"
        },
        "农田": {
            floor: 1,
            areaName: "农田",
            type: AreaType.安全区,
            needLv: 1,
            left: "1层-商店"
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
            areaName: "爱之湖",
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
            left: "绿野平原五",
            right: "绿野平原六",
            monster: [{ name: '琪露诺', lv: 10 }]
        },
        "绿野平原五": {
            floor: 1,
            areaName: "绿野平原五",
            type: AreaType.冒险区,
            needLv: 1,
            top: "绿野平原二",
            right: "绿野平原四"
        },
        "绿野平原六": {
            floor: 1,
            areaName: "绿野平原六",
            type: AreaType.冒险区,
            needLv: 1,
            left: "绿野平原四",
            top: "绿野平原三",
            monster: [{ name: "绿毒蛇", lv: 32 }]
        },
        "野猪巢穴": {
            floor: 1,
            areaName: "野猪巢穴",
            type: AreaType.BOSS区,
            needLv: 15,
            top: "绿野平原四",
            monster: [{ name: '蓬莱山辉夜', lv: 20 }]
        }
    },
    2: {
        "传送门": {
            floor: 2,
            areaName: "传送门",
            type: AreaType.传送门,
            needLv: 1,
            right: "希望之泉"
        },
        "希望之泉": {
            floor: 2,
            areaName: "希望之泉",
            type: AreaType.安全区,
            needLv: 1,
            top: "爱之湖",
            down: "农田",
            left: "传送门",
            right: "2层-商店",
        },
        "爱之湖": {
            floor: 2,
            areaName: "爱之湖",
            type: AreaType.安全区,
            needLv: 1,
            down: "希望之泉",
            right: "旅馆"
        },
        "农田": {
            floor: 2,
            areaName: "农田",
            type: AreaType.安全区,
            needLv: 1,
            top: "希望之泉",
            right: "银行"
        },
        "银行": {
            floor: 2,
            areaName: "银行",
            type: AreaType.银行,
            needLv: 1,
            top: "2层-商店",
            left: "农田"
        },
        "旅馆": {
            floor: 2,
            areaName: "旅馆",
            type: AreaType.安全区,
            needLv: 1,
            down: "2层-商店",
            left: "爱之湖"
        },
        "2层-商店": {
            floor: 2,
            areaName: "2层-商店",
            type: AreaType.安全区,
            needLv: 1,
            top: "旅馆",
            left: "希望之泉",
            right: "大草场",
            down: "银行"
        },
        "大草场": {
            floor: 2,
            areaName: "大草场",
            type: AreaType.安全区,
            needLv: 1,
            left: "2层-商店",
            right: "森林岔口"
        },
        "森林岔口": {
            floor: 2,
            areaName: "森林岔口",
            type: AreaType.BOSS区,
            needLv: 1,
            left: "大草场",
            top: "宁静森林二",
            down: "咆哮森林",
            monster: [{ name: '古明地恋', lv: 25 }]
        },
        "宁静森林二": {
            floor: 2,
            areaName: "宁静森林二",
            type: AreaType.冒险区,
            needLv: 1,
            top: "宁静部落",
            down: "森林岔口",
            monster: [{ name: "白洲梓", lv: 20 }]
        },
        "宁静部落": {
            floor: 2,
            areaName: "宁静部落",
            type: AreaType.冒险区,
            needLv: 1,
            top: "勇者祭坛",
            down: "宁静森林二",
            monster: [{ name: "菲比啾比", lv: 23 }, { name: "弗糯糯", lv: 23 }]
        },
        "勇者祭坛": {
            floor: 2,
            areaName: "勇者祭坛",
            type: AreaType.冒险区,
            needLv: 1,
            down: "宁静部落",
            monster: [{ name: 'kemomimi', lv: 22 }]
        },
        "咆哮森林": {
            floor: 2,
            areaName: "咆哮森林",
            type: AreaType.冒险区,
            needLv: 1,
            top: "森林岔口",
            down: "咆哮森林二"
        },
        "咆哮森林二": {
            floor: 2,
            areaName: "咆哮森林二",
            type: AreaType.冒险区,
            needLv: 1,
            top: "咆哮森林",
            down: "咆哮营地"
        },
        "咆哮营地": {
            floor: 2,
            areaName: "咆哮营地",
            type: AreaType.冒险区,
            needLv: 1,
            top: "咆哮森林二",
            down: "竞技场"
        },
        "竞技场": {
            floor: 2,
            areaName: "竞技场",
            type: AreaType.冒险区,
            needLv: 1,
            top: "咆哮营地",
            monster: [{ name: "星见雅", lv: 30 }]
        }
    },
    3: {
        "传送门": {
            floor: 3,
            areaName: "传送门",
            type: AreaType.传送门,
            needLv: 25,
            right: "兹穆弗特主街区"
        },
        "兹穆弗特主街区": {
            npc: ["smm"],
            info: "石板街道在雾气中延伸，商队和冒险者都在这里整备。",
            floor: 3,
            areaName: "兹穆弗特主街区",
            type: AreaType.安全区,
            needLv: 25,
            left: "传送门",
            top: "旧钟楼",
            right: "3层-商店",
            down: "薄雾街口"
        },
        "旧钟楼": {
            floor: 3,
            areaName: "旧钟楼",
            type: AreaType.银行,
            needLv: 25,
            down: "兹穆弗特主街区",
            right: "西城门"
        },
        "3层-商店": {
            floor: 3,
            areaName: "3层-商店",
            type: AreaType.安全区,
            needLv: 25,
            left: "兹穆弗特主街区",
            down: "巡礼驿站"
        },
        "巡礼驿站": {
            floor: 3,
            areaName: "巡礼驿站",
            type: AreaType.安全区,
            needLv: 25,
            top: "3层-商店",
            left: "薄雾街口"
        },
        "西城门": {
            floor: 3,
            areaName: "西城门",
            type: AreaType.冒险区,
            needLv: 26,
            left: "旧钟楼",
            down: "薄雾街口",
            monster: [{ name: "雾灯巡卫", lv: 28 }]
        },
        "薄雾街口": {
            floor: 3,
            areaName: "薄雾街口",
            type: AreaType.冒险区,
            needLv: 26,
            top: "兹穆弗特主街区",
            left: "西城门",
            right: "巡礼驿站",
            down: "灰瓦工坊",
            monster: [{ name: "雾灯巡卫", lv: 29 }, { name: "街角魔偶", lv: 30 }]
        },
        "灰瓦工坊": {
            floor: 3,
            areaName: "灰瓦工坊",
            type: AreaType.冒险区,
            needLv: 28,
            top: "薄雾街口",
            left: "齿轮仓库",
            right: "屋顶水道",
            monster: [{ name: "街角魔偶", lv: 31 }]
        },
        "齿轮仓库": {
            floor: 3,
            areaName: "齿轮仓库",
            type: AreaType.冒险区,
            needLv: 30,
            right: "灰瓦工坊",
            down: "雾钟塔",
            monster: [{ name: "齿轮守墓人", lv: 33 }]
        },
        "屋顶水道": {
            floor: 3,
            areaName: "屋顶水道",
            type: AreaType.冒险区,
            needLv: 30,
            left: "灰瓦工坊",
            down: "雾钟塔",
            monster: [{ name: "雨巷妖精", lv: 32 }]
        },
        "雾钟塔": {
            floor: 3,
            areaName: "雾钟塔",
            type: AreaType.BOSS区,
            needLv: 34,
            top: "齿轮仓库",
            right: "屋顶水道",
            monster: [{ name: "兹穆弗特钟卫", lv: 36 }]
        }
    },
    4: {
        "传送门": {
            floor: 4,
            areaName: "传送门",
            type: AreaType.传送门,
            needLv: 35,
            right: "月影港"
        },
        "月影港": {
            floor: 4,
            areaName: "月影港",
            info: "被月光照亮的港口，水面像一面缓慢呼吸的镜子。",
            type: AreaType.安全区,
            needLv: 35,
            left: "传送门",
            top: "海风旅馆",
            right: "4层-商店",
            down: "月影浅滩"
        },
        "海风旅馆": {
            floor: 4,
            areaName: "海风旅馆",
            type: AreaType.安全区,
            needLv: 35,
            down: "月影港",
            right: "灯塔银行"
        },
        "灯塔银行": {
            floor: 4,
            areaName: "灯塔银行",
            type: AreaType.银行,
            needLv: 35,
            left: "海风旅馆",
            down: "4层-商店"
        },
        "4层-商店": {
            floor: 4,
            areaName: "4层-商店",
            type: AreaType.安全区,
            needLv: 35,
            left: "月影港",
            top: "灯塔银行",
            down: "珊瑚阶梯"
        },
        "月影浅滩": {
            floor: 4,
            areaName: "月影浅滩",
            type: AreaType.冒险区,
            needLv: 36,
            top: "月影港",
            right: "珊瑚阶梯",
            down: "回潮洞口",
            monster: [{ name: "月湾水灵", lv: 38 }]
        },
        "珊瑚阶梯": {
            floor: 4,
            areaName: "珊瑚阶梯",
            type: AreaType.冒险区,
            needLv: 37,
            top: "4层-商店",
            left: "月影浅滩",
            down: "回潮洞口",
            monster: [{ name: "潮汐歌姬", lv: 40 }]
        },
        "回潮洞口": {
            floor: 4,
            areaName: "回潮洞口",
            type: AreaType.冒险区,
            needLv: 39,
            top: "月影浅滩",
            right: "珊瑚阶梯",
            down: "沉船甲板",
            monster: [{ name: "月湾水灵", lv: 41 }, { name: "潮汐歌姬", lv: 42 }]
        },
        "沉船甲板": {
            floor: 4,
            areaName: "沉船甲板",
            type: AreaType.冒险区,
            needLv: 42,
            top: "回潮洞口",
            left: "潮声回廊",
            right: "暗礁栈道",
            monster: [{ name: "沉船骑士", lv: 44 }]
        },
        "潮声回廊": {
            floor: 4,
            areaName: "潮声回廊",
            type: AreaType.冒险区,
            needLv: 43,
            right: "沉船甲板",
            down: "月蚀灯塔",
            monster: [{ name: "潮汐歌姬", lv: 45 }]
        },
        "暗礁栈道": {
            floor: 4,
            areaName: "暗礁栈道",
            type: AreaType.冒险区,
            needLv: 43,
            left: "沉船甲板",
            down: "月蚀灯塔",
            monster: [{ name: "月湾水灵", lv: 45 }, { name: "沉船骑士", lv: 46 }]
        },
        "月蚀灯塔": {
            floor: 4,
            areaName: "月蚀灯塔",
            type: AreaType.BOSS区,
            needLv: 47,
            top: "潮声回廊",
            right: "暗礁栈道",
            monster: [{ name: "月蚀灯守", lv: 48 }]
        }
    },
    5: {
        "传送门": {
            floor: 5,
            areaName: "传送门",
            type: AreaType.传送门,
            needLv: 48,
            right: "星砂集市"
        },
        "星砂集市": {
            floor: 5,
            areaName: "星砂集市",
            info: "高空沙海中的集市，摊位上出售着从星尘里淘出的奇物。",
            type: AreaType.安全区,
            needLv: 48,
            left: "传送门",
            top: "观星旅社",
            right: "5层-商店",
            down: "星砂外缘"
        },
        "观星旅社": {
            floor: 5,
            areaName: "观星旅社",
            type: AreaType.安全区,
            needLv: 48,
            down: "星砂集市",
            right: "星币银行"
        },
        "星币银行": {
            floor: 5,
            areaName: "星币银行",
            type: AreaType.银行,
            needLv: 48,
            left: "观星旅社",
            down: "5层-商店"
        },
        "5层-商店": {
            floor: 5,
            areaName: "5层-商店",
            type: AreaType.安全区,
            needLv: 48,
            left: "星砂集市",
            top: "星币银行",
            down: "陨星阶梯"
        },
        "星砂外缘": {
            floor: 5,
            areaName: "星砂外缘",
            type: AreaType.冒险区,
            needLv: 49,
            top: "星砂集市",
            right: "陨星阶梯",
            down: "折光沙丘",
            monster: [{ name: "星砂游魂", lv: 50 }]
        },
        "陨星阶梯": {
            floor: 5,
            areaName: "陨星阶梯",
            type: AreaType.冒险区,
            needLv: 50,
            top: "5层-商店",
            left: "星砂外缘",
            down: "折光沙丘",
            monster: [{ name: "陨铁傀儡", lv: 52 }]
        },
        "折光沙丘": {
            floor: 5,
            areaName: "折光沙丘",
            type: AreaType.冒险区,
            needLv: 52,
            top: "星砂外缘",
            right: "陨星阶梯",
            down: "流星峡谷",
            monster: [{ name: "星砂游魂", lv: 53 }, { name: "陨铁傀儡", lv: 54 }]
        },
        "流星峡谷": {
            floor: 5,
            areaName: "流星峡谷",
            type: AreaType.冒险区,
            needLv: 55,
            top: "折光沙丘",
            left: "无光裂隙",
            right: "星核祭坛",
            monster: [{ name: "星核祭司", lv: 56 }]
        },
        "无光裂隙": {
            floor: 5,
            areaName: "无光裂隙",
            type: AreaType.冒险区,
            needLv: 56,
            right: "流星峡谷",
            down: "坠星王座",
            monster: [{ name: "星砂游魂", lv: 57 }, { name: "星核祭司", lv: 58 }]
        },
        "星核祭坛": {
            floor: 5,
            areaName: "星核祭坛",
            type: AreaType.冒险区,
            needLv: 56,
            left: "流星峡谷",
            down: "坠星王座",
            monster: [{ name: "陨铁傀儡", lv: 58 }, { name: "星核祭司", lv: 58 }]
        },
        "坠星王座": {
            floor: 5,
            areaName: "坠星王座",
            type: AreaType.BOSS区,
            needLv: 60,
            top: "无光裂隙",
            right: "星核祭坛",
            monster: [{ name: "坠星王", lv: 60 }]
        }
    }
}
