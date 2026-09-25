import { Context, Session } from "koishi"
import { Config } from "."

/** 内容发送模块 */
export const Chat = {
    config: {} as Config,
    ctx: {} as Context,
    chache: {},
    async init(config: Config, ctx: Context) {
        Chat.config = config
        Chat.ctx = ctx
    },
    /** 发送消息 */
    async send(session: Session, content: string) {
        if (session.platform !== 'qq') {
            await session.send(content)
            return
        }
        const messageId = session.messageId

        // 记录步骤值
        if (Chat.chache[messageId] == undefined) {
            Chat.chache[messageId] = 0
        } else {
            console.log(`检测到MD连续发送，尝试递增 msg_seq 再进行再次发送；第${Chat.chache[messageId] + 1}次。`);
            if (Chat.chache[messageId] >= 5) {
                console.log(`超过主动MD连续发送上限次数，转为普通发送`);
                await session.send(content)
            }
        }
        if (Chat.config.useMd) {
            try {
                // 判断是否为 私聊/群聊 触发
                if (session.guildId) {
                    await session.bot.internal.sendMessage(session.channelId, {
                        msg_id: session.messageId,
                        msg_type: 2,
                        msg_seq: ++Chat.chache[messageId] == 1 ? 0 : Chat.chache[messageId],
                        markdown: {
                            content
                        }
                    })
                } else {
                    (session as any).qq.sendPrivateMessage(session.userId, {
                        msg_id: session.messageId,
                        msg_type: 2,
                        msg_seq: ++Chat.chache[messageId] == 1 ? 0 : Chat.chache[messageId],
                        markdown: {
                            content
                        }
                    })
                }
            } catch (error) {
                console.log(error);
            }
            Chat.clearChache()
        } else {
            await session.send(content)
        }
    },
    // 当前 session 是否可以使用MD
    isUseMd(session: Session) {
        if (session.platform !== 'qq') return false
        if (Chat.chache[session.messageId] == undefined) return true
        return Chat.chache[session.messageId] <= 5
    },
    /** 清除 msgid 记录 */
    clearChache() {
        const chache = Object.keys(Chat.chache)
        if (chache.length >= 40) {
            delete chache[0]
        }
    }
}
