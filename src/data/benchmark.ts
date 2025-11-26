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

export type UserBenchmark = {
    [keys: number]: {
        /** 最大经验 */
        maxExp: number,
        /** 最大血量 */
        maxHp: number,
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

/** 怪物等级公式 */
export const monsterBenchmark: MonsterBenchmark = {
    10: {
        hp: 1.4,
        maxHp: 1.4,
        mp: 1.2,
        maxMp: 1.2,
        atk: 1.2,
        def: 1.1,
        chr: 1.1,
        evasion: 1.1,
        hit: 1.1,
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
        chr: 1.08,
        evasion: 1.08,
        hit: 1.08,
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
}
/** 玩家等级公式 */
export const userBenchmark: UserBenchmark = {
    10: {
        maxExp: 2,
        maxHp: 1.2,
        maxMp: 1.1,
        atk: 1.12,
        def: 1.1,
        chr: 1.08,
        evasion: 1.08,
        hit: 1.08,
        ghd: 1.0,
        speed: 1.05
    },
    20: {
        maxExp: 1.8,
        maxHp: 1.15,
        maxMp: 1.1,
        atk: 1.1,
        def: 1.1,
        chr: 1.04,
        evasion: 1.04,
        hit: 1.04,
        ghd: 1.0,
        speed: 1.05
    },
    40: {
        maxExp: 1.5,
        maxHp: 1.1,
        maxMp: 1.05,
        atk: 1.1,
        def: 1.05,
        chr: 1.03,
        evasion: 1.03,
        hit: 1.03,
        ghd: 1.05,
        speed: 1.05
    }
}