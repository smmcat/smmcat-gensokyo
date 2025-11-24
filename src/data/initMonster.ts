export enum MonsterOccupation {
    野怪 = "野怪",
    BOSS = "BOSS"
}
export const monsterData = {
    "小蜜蜂": {
        name: "小蜜蜂",
        type: MonsterOccupation.野怪,
        info: '幻想乡一层常见的生物',
        hp: 50,
        maxHp: 50,
        mp: 30,
        maxMp: 30,
        atk: 7,
        def: 2,
        chr: 50,
        evasion: 100,
        hit: 1000,
        ghd: 1.2,
        speed: 4,
        giveExp: 10
    },
    "小蜘蛛": {
        name: "小蜘蛛",
        type: MonsterOccupation.野怪,
        info: '幻想乡一层常见的生物',
        hp: 55,
        maxHp: 55,
        mp: 30,
        maxMp: 30,
        atk: 10,
        def: 3,
        chr: 50,
        evasion: 200,
        hit: 1000,
        ghd: 1.2,
        speed: 4,
        giveExp: 12
    },
    "dora": {
        name: "dora",
        type: MonsterOccupation.野怪,
        info: '偶尔出没在一层世界的奇怪生物',
        hp: 88,
        maxHp: 88,
        mp: 10,
        maxMp: 10,
        atk: 20,
        def: 5,
        chr: 200,
        evasion: 300,
        hit: 1000,
        ghd: 1.2,
        speed: 4,
        giveExp: 15
    }
}