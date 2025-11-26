import { DatabaseUserAttribute } from "../users"

export enum PropType {
    消耗类 = '消耗类',
    礼包类 = '礼包类',
    任务道具 = '任务道具'
}

export type propsTemplateData = {
    [keys: string]: {
        name: string,
        type: PropType,
        info: string,
        price: number,
        fn: (user: DatabaseUserAttribute) => void
    }
}
const propsData: propsTemplateData = {
    "红药": {
        name: "红药",
        type: PropType.消耗类,
        info: '回复自身20HP',
        price: 30,
        fn: function () {

        }
    }
}