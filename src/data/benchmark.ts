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
        hp: 1.2,
        maxHp: 1.2,
        mp: 1.1,
        maxMp: 1.1,
        atk: 1.1,
        def: 1.1,
        chr: 1.1,
        evasion: 1.1,
        hit: 1.01,
        ghd: 1.005, 
        speed: 1.05
    },
    20: {
        hp: 1.1,
        maxHp: 1.1,
        mp: 1.1,
        maxMp: 1.1,
        atk: 1.08,
        def: 1.1,
        chr: 1.08,
        evasion: 1.008,
        hit: 1.008,
        ghd: 1.004,
        speed: 1.05
    },
    40: {
        hp: 1.08,
        maxHp: 1.08,
        mp: 1.05,
        maxMp: 1.05,
        atk: 1.05,
        def: 1.05,
        chr: 1.05,
        evasion: 1.005,
        hit: 1.005,
        ghd: 1.003,
        speed: 1.05
    }
}
/** 玩家等级公式 */
export const userBenchmark: UserBenchmark = {
    10: {
        maxExp: 1.3,
        maxHp: 1.13,
        maxMp: 1.13,
        atk: 1.1,
        def: 1.1,
        chr: 1.08,
        evasion: 1.009,
        hit: 1.008,
        ghd: 1.0,
        speed: 1.05
    },
    20: {
        maxExp: 1.2,
        maxHp: 1.08,
        maxMp: 1.08,
        atk: 1.08,
        def: 1.1,
        chr: 1.04,
        evasion: 1.005, 
        hit: 1.004,
        ghd: 1.0,
        speed: 1.05
    },
    40: {
        maxExp: 1.1,
        maxHp: 1.05,
        maxMp: 1.05,
        atk: 1.05,
        def: 1.05,
        chr: 1.03,
        evasion: 1.003,
        hit: 1.003,
        ghd: 1.005,
        speed: 1.05
    }
}