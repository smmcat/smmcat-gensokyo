const nameList = {
    '张三': {
        age: 25
    },
    '李四': {
        age: 30
    }
} as const; // 使用 as const 确保类型推断为字面量类型

const fn = (name: keyof typeof nameList) => {
    return nameList[name];
}

fn('张三')