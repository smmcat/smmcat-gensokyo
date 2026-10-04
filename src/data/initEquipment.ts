import { BattleAttribute } from "../battle";
import { MainUpTypeDict } from "../equipment";
import { UserBaseAttribute } from "../users";

export enum Equipment {
    武器 = '武器',
    头盔 = '头盔',
    护甲 = '护甲',
    鞋子 = '鞋子',
    项链 = '项链',
    裤子 = '裤子',
    披风 = '披风'
}

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


// 定义每个装备类型的特定类型
type WeaponItem = EquipmentItem & { type: Equipment.武器, mainUpType: 'atk' }
type HelmetItem = EquipmentItem & { type: Equipment.头盔, mainUpType: 'hit' | 'csr' }
type ArmorItem = EquipmentItem & { type: Equipment.护甲, mainUpType: 'maxHp' }
type ShoesItem = EquipmentItem & { type: Equipment.鞋子, mainUpType: 'speed' }
type NecklaceItem = EquipmentItem & { type: Equipment.项链, mainUpType: 'chr' | 'ghd' }
type PantsItem = EquipmentItem & { type: Equipment.裤子, mainUpType: 'evasion' | 'def' }
type CloakItem = EquipmentItem & { type: Equipment.披风, mainUpType: 'maxMp' | 'reduction' }

// 装备默认配置项
type EquipmentItem = {
    type: Equipment,
    name: string,
    suit: string,
    info: string,
    star: number,
    mainUpType: MainUpTypeDict,
    mainAttr: number
}

// 联合所有装备类型
export type AnyEquipmentItem =
    | WeaponItem
    | HelmetItem
    | ArmorItem
    | ShoesItem
    | NecklaceItem
    | PantsItem
    | CloakItem


export const equipmentData: { [keys: string]: AnyEquipmentItem } = {
    "新手头盔": {
        type: Equipment.头盔,
        name: "新手头盔",
        suit: "新手的勇气",
        info: "新手佩戴的头盔，(2件套)战斗前额外增加 20% 生命值上限。(4件套)战斗时获得 恢复 被动",
        star: 1,
        mainUpType: 'hit',
        mainAttr: 100
    },
    "新手披风": {
        type: Equipment.披风,
        name: "新手披风",
        suit: "新手的勇气",
        info: "新手佩戴的披风，(2件套)战斗前额外增加 20% 生命值上限。(4件套)战斗时获得 恢复 被动",
        star: 1,
        mainUpType: 'maxMp',
        mainAttr: 30
    },
    "新手之剑": {
        type: Equipment.武器,
        name: "新手之剑",
        suit: "新手的勇气",
        info: "新手佩戴的武器，(2件套)战斗前额外增加 20% 生命值上限。(4件套)战斗时获得 恢复 被动",
        star: 1,
        mainUpType: 'atk',
        mainAttr: 5
    },
    "新手鞋子": {
        type: Equipment.鞋子,
        name: "新手鞋子",
        suit: "新手的勇气",
        info: "新手佩戴的鞋子，(2件套)战斗前额外增加 20% 生命值上限。(4件套)战斗时获得 恢复 被动",
        star: 1,
        mainUpType: 'speed',
        mainAttr: 2
    },
    "新手项链": {
        type: Equipment.项链,
        name: "新手项链",
        suit: "新手的勇气",
        info: "新手佩戴的鞋子，(2件套)战斗前额外增加 20% 生命值上限。(4件套)战斗时获得 恢复 被动",
        star: 1,
        mainUpType: 'chr',
        mainAttr: 10
    },
    "雾巡长刃": {
        type: Equipment.武器,
        name: "雾巡长刃",
        suit: "雾城巡礼",
        info: "兹穆弗特巡卫使用的制式长刃。(2件套)战斗前提高 15% 命中值。(4件套)战斗时获得 心眼 被动",
        star: 2,
        mainUpType: 'atk',
        mainAttr: 18
    },
    "雾巡头盔": {
        type: Equipment.头盔,
        name: "雾巡头盔",
        suit: "雾城巡礼",
        info: "兹穆弗特巡卫使用的头盔。(2件套)战斗前提高 15% 命中值。(4件套)战斗时获得 心眼 被动",
        star: 2,
        mainUpType: 'hit',
        mainAttr: 180
    },
    "雾巡护甲": {
        type: Equipment.护甲,
        name: "雾巡护甲",
        suit: "雾城巡礼",
        info: "兹穆弗特巡卫使用的护甲。(2件套)战斗前提高 15% 命中值。(4件套)战斗时获得 心眼 被动",
        star: 2,
        mainUpType: 'maxHp',
        mainAttr: 180
    },
    "雾巡短靴": {
        type: Equipment.鞋子,
        name: "雾巡短靴",
        suit: "雾城巡礼",
        info: "兹穆弗特巡卫使用的短靴。(2件套)战斗前提高 15% 命中值。(4件套)战斗时获得 心眼 被动",
        star: 2,
        mainUpType: 'speed',
        mainAttr: 5
    },
    "雾巡腰裤": {
        type: Equipment.裤子,
        name: "雾巡腰裤",
        suit: "雾城巡礼",
        info: "兹穆弗特巡卫使用的腰裤。(2件套)战斗前提高 15% 命中值。(4件套)战斗时获得 心眼 被动",
        star: 2,
        mainUpType: 'def',
        mainAttr: 12
    },
    "潮汐法杖": {
        type: Equipment.武器,
        name: "潮汐法杖",
        suit: "月潮回响",
        info: "月影港中由潮汐魔力凝成的法杖。(2件套)战斗前提高 10% 最大魔法值。(4件套)战斗时获得 吸血 被动",
        star: 3,
        mainUpType: 'atk',
        mainAttr: 28
    },
    "潮汐项链": {
        type: Equipment.项链,
        name: "潮汐项链",
        suit: "月潮回响",
        info: "月影港中由潮汐魔力凝成的项链。(2件套)战斗前提高 10% 最大魔法值。(4件套)战斗时获得 吸血 被动",
        star: 3,
        mainUpType: 'chr',
        mainAttr: 90
    },
    "潮汐披风": {
        type: Equipment.披风,
        name: "潮汐披风",
        suit: "月潮回响",
        info: "月影港中由潮汐魔力凝成的披风。(2件套)战斗前提高 10% 最大魔法值。(4件套)战斗时获得 吸血 被动",
        star: 3,
        mainUpType: 'maxMp',
        mainAttr: 160
    },
    "潮汐护甲": {
        type: Equipment.护甲,
        name: "潮汐护甲",
        suit: "月潮回响",
        info: "月影港中由潮汐魔力凝成的护甲。(2件套)战斗前提高 10% 最大魔法值。(4件套)战斗时获得 吸血 被动",
        star: 3,
        mainUpType: 'maxHp',
        mainAttr: 260
    },
    "潮汐长靴": {
        type: Equipment.鞋子,
        name: "潮汐长靴",
        suit: "月潮回响",
        info: "月影港中由潮汐魔力凝成的长靴。(2件套)战斗前提高 10% 最大魔法值。(4件套)战斗时获得 吸血 被动",
        star: 3,
        mainUpType: 'speed',
        mainAttr: 8
    },
    "星砂刃": {
        type: Equipment.武器,
        name: "星砂刃",
        suit: "坠星遗辉",
        info: "在高空沙海里吸收星尘的兵器。(2件套)战斗前提高 10% 攻击力。(4件套)战斗时获得 破势 被动",
        star: 4,
        mainUpType: 'atk',
        mainAttr: 42
    },
    "星砂冠": {
        type: Equipment.头盔,
        name: "星砂冠",
        suit: "坠星遗辉",
        info: "在高空沙海里吸收星尘的头冠。(2件套)战斗前提高 10% 攻击力。(4件套)战斗时获得 破势 被动",
        star: 4,
        mainUpType: 'csr',
        mainAttr: 80
    },
    "星砂甲": {
        type: Equipment.护甲,
        name: "星砂甲",
        suit: "坠星遗辉",
        info: "在高空沙海里吸收星尘的护甲。(2件套)战斗前提高 10% 攻击力。(4件套)战斗时获得 破势 被动",
        star: 4,
        mainUpType: 'maxHp',
        mainAttr: 420
    },
    "星砂坠": {
        type: Equipment.项链,
        name: "星砂坠",
        suit: "坠星遗辉",
        info: "在高空沙海里吸收星尘的坠饰。(2件套)战斗前提高 10% 攻击力。(4件套)战斗时获得 破势 被动",
        star: 4,
        mainUpType: 'chr',
        mainAttr: 130
    },
    "星砂披风": {
        type: Equipment.披风,
        name: "星砂披风",
        suit: "坠星遗辉",
        info: "在高空沙海里吸收星尘的披风。(2件套)战斗前提高 10% 攻击力。(4件套)战斗时获得 破势 被动",
        star: 4,
        mainUpType: 'maxMp',
        mainAttr: 260
    },
    "妹红之棒": {
        type: Equipment.武器,
        name: "妹红之棒",
        suit: "不死者的威压",
        info: "妹红随身携带的木棒，据说是拿来捅篝火、揍妖怪、敲人脑袋三用的。(2件套)战斗前增加 10% 暴击率。(4件套)战斗前获得基于最大生命值 2% 的护盾",
        star: 5,
        mainUpType: 'atk',
        mainAttr: 58
    },
    "妹红头巾": {
        type: Equipment.头盔,
        name: "妹红头巾",
        suit: "不死者的威压",
        info: "缠在头上的红白布巾，既是装饰也是睡觉时用来遮脸的。(2件套)战斗前增加 10% 暴击率。(4件套)战斗前获得基于最大生命值 2% 的护盾",
        star: 5,
        mainUpType: 'csr',
        mainAttr: 110
    },
    "妹红衬衫": {
        type: Equipment.护甲,
        name: "妹红衬衫",
        suit: "不死者的威压",
        info: "那件万年不变的白衬衫配红色吊带，看似破烂却怎么烧都烧不坏。(2件套)战斗前增加 10% 暴击率。(4件套)战斗前获得基于最大生命值 2% 的护盾",
        star: 5,
        mainUpType: 'maxHp',
        mainAttr: 560
    },
    "妹红之坠": {
        type: Equipment.项链,
        name: "妹红之坠",
        suit: "不死者的威压",
        info: "挂在脖子上的旧式吊坠，里面封存着一缕不灭的火。(2件套)战斗前增加 10% 暴击率。(4件套)战斗前获得基于最大生命值 2% 的护盾",
        star: 5,
        mainUpType: 'chr',
        mainAttr: 170
    },
    "妹红被单": {
        type: Equipment.披风,
        name: "妹红被单",
        suit: "不死者的威压",
        info: "风餐露宿、在路边倒头就睡时盖的那条被单，脏得看不出原本的颜色。(2件套)战斗前增加 10% 暴击率。(4件套)战斗前获得基于最大生命值 2% 的护盾",
        star: 5,
        mainUpType: 'reduction',
        mainAttr: 0.08
    },
    "蕾米莉亚之枪": {
        type: Equipment.武器,
        name: "蕾米莉亚之枪",
        suit: "绯红威严",
        info: "红魔馆主人惯用的骑枪，枪尖凝着不散的绯红杀意。(2件套)战斗前提高 20% 生命值上限。(4件套)战斗时获得 鸣屋 被动",
        star: 5,
        mainUpType: 'atk',
        mainAttr: 70
    },
    "蕾米莉亚礼帽": {
        type: Equipment.头盔,
        name: "蕾米莉亚礼帽",
        suit: "绯红威严",
        info: "缀着红色缎带的粉色礼帽，是红魔馆大小姐仪态的象征。(2件套)战斗前提高 20% 生命值上限。(4件套)战斗时获得 鸣屋 被动",
        star: 5,
        mainUpType: 'csr',
        mainAttr: 120
    },
    "蕾米莉亚洋装": {
        type: Equipment.护甲,
        name: "蕾米莉亚洋装",
        suit: "绯红威严",
        info: "红魔馆制式的粉色哥特洋装，端庄之下暗藏着领主的威压。(2件套)战斗前提高 20% 生命值上限。(4件套)战斗时获得 鸣屋 被动",
        star: 5,
        mainUpType: 'maxHp',
        mainAttr: 620
    },
    "蕾米莉亚红晶": {
        type: Equipment.项链,
        name: "蕾米莉亚红晶",
        suit: "绯红威严",
        info: "胸前垂落的绯红水晶，据说是红魔馆深处凝聚的血之精华。(2件套)战斗前提高 20% 生命值上限。(4件套)战斗时获得 鸣屋 被动",
        star: 5,
        mainUpType: 'chr',
        mainAttr: 190
    },
    "蕾米莉亚披风": {
        type: Equipment.披风,
        name: "蕾米莉亚披风",
        suit: "绯红威严",
        info: "在红魔馆走廊间飘荡的红色披风，所过之处皆俯首低眉。(2件套)战斗前提高 20% 生命值上限。(4件套)战斗时获得 鸣屋 被动",
        star: 5,
        mainUpType: 'reduction',
        mainAttr: 0.09
    }
}

export type SuitDictList = {
    [keys: string]: {
        twoPiece: (agent: BattleAttribute) => void,
        fourPiece: (agent: BattleAttribute) => void,
        info: string
    }
}

export const SuitDict: SuitDictList = {
    "新手的勇气": {
        twoPiece(agent: BattleAttribute) {
            agent.maxHp += Math.floor(agent.maxHp * 0.2)
        },
        fourPiece(agent: BattleAttribute) {
            agent.equipmentPassiveList = agent.equipmentPassiveList.filter(i => i !== '恢复')
            agent.equipmentPassiveList.push('恢复')
        },
        info: '很显然，初出茅庐的冒险家有了套完整的装备后就能充满勇气。(2件套)战斗前额外增加 20% 生命值上限。(4件套)战斗时获得 恢复 被动'
    },
    "雾城巡礼": {
        twoPiece(agent: BattleAttribute) {
            agent.hit += Math.floor(agent.hit * 0.15)
        },
        fourPiece(agent: BattleAttribute) {
            agent.equipmentPassiveList = agent.equipmentPassiveList.filter(i => i !== '心眼')
            agent.equipmentPassiveList.push('心眼')
        },
        info: '雾城巡卫遗留下来的巡礼装备。(2件套)战斗前提高 15% 命中值。(4件套)战斗时获得 心眼 被动'
    },
    "月潮回响": {
        twoPiece(agent: BattleAttribute) {
            agent.maxMp += Math.floor(agent.maxMp * 0.1)
        },
        fourPiece(agent: BattleAttribute) {
            agent.equipmentPassiveList = agent.equipmentPassiveList.filter(i => i !== '吸血')
            agent.equipmentPassiveList.push('吸血')
        },
        info: '月潮退去后仍在回响的装备。(2件套)战斗前提高 10% 最大魔法值。(4件套)战斗时获得 吸血 被动'
    },
    "坠星遗辉": {
        twoPiece(agent: BattleAttribute) {
            agent.atk += Math.floor(agent.atk * 0.1)
        },
        fourPiece(agent: BattleAttribute) {
            agent.equipmentPassiveList = agent.equipmentPassiveList.filter(i => i !== '破势')
            agent.equipmentPassiveList.push('破势')
        },
        info: '坠星残留的辉光凝成的装备。(2件套)战斗前提高 10% 攻击力。(4件套)战斗时获得 破势 被动'
    },
    "不死者的威压": {
        twoPiece(agent: BattleAttribute) {
            agent.chr += 100
        },
        fourPiece(agent: BattleAttribute) {
            agent.shield = Math.min(agent.maxHp, (agent.shield || 0) + Math.floor(agent.maxHp * 0.02))
        },
        info: '藤原妹红散落的随身物件所制。(2件套)战斗前增加 10% 暴击率。(4件套)战斗前获得基于最大生命值 2% 的护盾'
    },
    "绯红威严": {
        twoPiece(agent: BattleAttribute) {
            agent.maxHp += Math.floor(agent.maxHp * 0.2)
        },
        fourPiece(agent: BattleAttribute) {
            agent.equipmentPassiveList = agent.equipmentPassiveList.filter(i => i !== '鸣屋')
            agent.equipmentPassiveList.push('鸣屋')
        },
        info: '红魔馆主人蕾米莉亚的随身衣物所制，端庄之下透着不容置疑的威压。(2件套)战斗前提高 20% 生命值上限。(4件套)战斗时获得 鸣屋 被动'
    }
}

