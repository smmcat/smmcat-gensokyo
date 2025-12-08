export const random = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/** 血量可视化 */
export const generateHealthDisplay = (current: number, total: number): string => {
    const ratio = current / total;
    const displayLength = 10;
    const filledLength = Math.floor(ratio * displayLength);
    const unfilledLength = displayLength - filledLength;

    const filled = "■".repeat(filledLength);
    const unfilled = "□".repeat(unfilledLength);
    return filled + unfilled;
}


export const getFreeList = (arr: any[]): any[] => {
    //临时数组，用于存值
    let arrAdd = [...arr];
    for (let i = 1; i < arrAdd.length; i++) {
        const random = Math.floor(Math.random() * (i + 1));
        //交换两个数组
        [arrAdd[i], arrAdd[random]] = [arrAdd[random], arrAdd[i]];
    }
    return arrAdd;
}


export class AsyncOperationQueue {
    queue: any[]
    running: boolean
    constructor() {
        this.queue = []
        this.running = false
    }
    async add(operation) {
        return new Promise((resolve, reject) => {
            this.queue.push({ operation, resolve, reject })
            if (!this.running) {
                this.process()
            }
        })
    }
    async process() {
        if (this.queue.length === 0) {
            this.running = false
            return
        }
        this.running = true
        const { operation, resolve, reject } = this.queue.shift()
        try {
            const result = await operation()
            resolve(result)
        } catch (error) {
            reject(error)
        }
        // 继续处理下一个任务
        this.process()
    }
}