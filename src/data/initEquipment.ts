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
    }
}

export type SuitDictList = {
    [keys: string]: {
        twoPiece: (agent: BattleAttribute) => void,
        fourPiece: (agent: BattleAttribute) => void
    }
}

export const SuitDict: SuitDictList = {
    "新手的勇气": {
        twoPiece(agent: BattleAttribute) {
            agent.maxHp += Math.floor(agent.maxHp * 0.2)
        },
        fourPiece(agent: BattleAttribute) {
            agent.passiveList.push('恢复')
        }
    }
}

