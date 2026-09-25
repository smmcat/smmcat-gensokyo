import { Context, Session } from "koishi"
import { Config } from "."
import { Chat } from "./chatSend"
import { User } from "./users"

/**
 * 银行项目 存款后每天均可获得收益，收益的算法为：昨天实际金额 * 0.02
 * 
 */
type UserDatabaseBank = {
    /** 用户标识 */
    userId?: string,
    /** 结算资金 */
    amount: number,
    /** 不结算资金 */
    excludeAmount: number,
    /** 利息比例 */
    interestRate: number,
    /** 更新时间 */
    updateTime: string
}

declare module 'koishi' {
    interface Tables {
        smm_gensokyo_user_bank: UserDatabaseBank
    }
}

export const BankFn = {
    config: {} as Config,
    ctx: {} as Context,
    /** 初始化项目 */
    async init(config: Config, ctx: Context) {
        BankFn.config = config;
        BankFn.ctx = ctx;

        // 创建数据库表结构
        ctx.model.extend(
            'smm_gensokyo_user_bank',
            {
                userId: "string",
                amount: 'integer',
                excludeAmount: 'integer',
                interestRate: 'double',
                updateTime: 'string'
            },
            {
                primary: 'userId',
                autoInc: false
            }
        )
    },
    /** 更新资产 */
    async updateSettlement(data: UserDatabaseBank) {
        const { userId } = data;
        const beforTime = +new Date(data.updateTime);
        const nowTime = +new Date();

        const msPerDay = 24 * 60 * 60 * 1000;
        const diffMs = nowTime - beforTime;
        let days = Math.max(0, Math.floor(diffMs / msPerDay));

        if (!days) return { isUp: false, num: 0, data }
        let num = 0;
        let { amount, excludeAmount } = data

        while (days--) {
            const daily = Math.ceil(amount * data.interestRate)
            amount += daily
            num += daily
            if (days == 0) {
                amount += excludeAmount
                excludeAmount = 0
            }
        }
        const temp: UserDatabaseBank = {
            amount,
            excludeAmount,
            interestRate: data.interestRate,
            updateTime: new Date().toLocaleDateString()
        }
        await BankFn.ctx.database.set('smm_gensokyo_user_bank', { userId }, temp)
        return { isUp: true, num, data: { ...temp, userId } }
    },
    /** 存款操作 */
    async deposit(session: Session, total: number) {
        const { userId } = session
        const beforData = await BankFn.getBankData(userId)
        const currentData = await BankFn.updateSettlement(beforData)
        if (currentData.num) {
            await Chat.send(session, `记录上次收益，共获得${currentData.num}${BankFn.config.currency}`)
        }
        await User.lostMonetary(userId, total, async (e) => {
            if (e.err) {
                await Chat.send(session, e.err)
                return
            }

            // 建立数据库信息
            currentData.data.excludeAmount += total
            const temp: UserDatabaseBank = {
                amount: currentData.data.amount,
                excludeAmount: currentData.data.excludeAmount,
                interestRate: currentData.data.interestRate,
                updateTime: currentData.data.updateTime
            }
            await BankFn.ctx.database.set('smm_gensokyo_user_bank', { userId }, temp)
            await Chat.send(session, `存款成功！当前持有${BankFn.config.currency}为：${e.currentVal}` +
                '\n\n***\n\n' +
                `**含利息${BankFn.config.currency}** ${currentData.data.amount}\n` +
                `**不含利${BankFn.config.currency}** ${currentData.data.excludeAmount}\n` +
                `**账号利息汇率** ${currentData.data.interestRate}\n` +
                `> 更新时间：${currentData.data.updateTime}`
            )
        })
    },
    /** 取款操作 */
    async withdraw(session: Session, total: number) {
        const { userId } = session
        const beforData = await BankFn.getBankData(userId)
        const currentData = await BankFn.updateSettlement(beforData)
        if (currentData.num) {
            await Chat.send(session, `记录上次收益，共获得${currentData.num}${BankFn.config.currency}`)
        }

        if (currentData.data.amount + currentData.data.excludeAmount < total) {
            if (BankFn.config.useMd) {
                await Chat.send(session, `银行余额不足，无法从银行取出当前需求数量的${BankFn.config.currency}。` +
                    `\n<qqbot-cmd-input text="/查看存款" show="查看当前银行存款" reference="false"/>`)
            } else {
                await Chat.send(session, `银行余额不足，无法从银行取出当前需求数量的${BankFn.config.currency}。` +
                    `\n若需要查看当前银行存款，请先 /查看存款`)
            }
            return
        }
        currentData.data.excludeAmount -= total
        if (currentData.data.excludeAmount < 0) {
            currentData.data.amount -= Math.abs(currentData.data.excludeAmount)
            currentData.data.excludeAmount = 0
        }
        await User.giveMonetary(userId, total, async (e) => {
            if (e.err) {
                await Chat.send(session, e.err)
                return
            }

            // 建立数据库信息
            const temp: UserDatabaseBank = {
                amount: currentData.data.amount,
                excludeAmount: currentData.data.excludeAmount,
                interestRate: currentData.data.interestRate,
                updateTime: currentData.data.updateTime
            }
            await BankFn.ctx.database.set('smm_gensokyo_user_bank', { userId }, temp)
            await Chat.send(session, `取款成功！当前持有${BankFn.config.currency}为：${e.currentVal}` +
                '\n\n***\n\n' +
                `**含利息${BankFn.config.currency}** ${currentData.data.amount}\n` +
                `**不含利${BankFn.config.currency}** ${currentData.data.excludeAmount}\n` +
                `**账号利息汇率** ${currentData.data.interestRate}\n` +
                `> 更新时间：${currentData.data.updateTime}`
            )
        })
    },
    /** 查看当前银行存款 */
    async showView(session: Session) {
        const { userId } = session
        const beforData = await BankFn.getBankData(userId)
        const currentData = await BankFn.updateSettlement(beforData)
        if (currentData.num) {
            await Chat.send(session, `记录上次收益，共获得${currentData.num}${BankFn.config.currency}`)
        }
        await Chat.send(session, `个人银行信息：` +
            '\n\n***\n\n' +
            `**含利息${BankFn.config.currency}** ${currentData.data.amount}\n` +
            `**不含利${BankFn.config.currency}** ${currentData.data.excludeAmount}\n` +
            `**账号利息汇率** ${currentData.data.interestRate}\n` +
            `> 更新时间：${currentData.data.updateTime}`
        )
    },
    /** 获取存款记录 */
    async getBankData(userId: string) {
        const [data] = await BankFn.ctx.database.get('smm_gensokyo_user_bank', { userId })
        if (data) return data
        const temp = {
            userId,
            amount: 0,
            excludeAmount: 0,
            interestRate: 0.02,
            updateTime: new Date().toLocaleDateString()
        }
        await BankFn.ctx.database.create('smm_gensokyo_user_bank', temp)
        return temp
    }
}