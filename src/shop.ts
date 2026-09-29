import { Context, Session } from "koishi"
import { Config } from "."
import { Chat } from "./chatSend"
import { User } from "./users"
import { Props } from "./props"
import { propsData, PropType } from "./data/initProps"
import { shopFloorData } from "./data/initShop"
import { GensokyoMap } from "./map"
import { AreaType } from "./data/initMap"

/** 商店单个道具缓存数据 */
export type ShopCacheItem = {
    /** 道具名 */
    name: string,
    /** 商店售价（售出价格的3倍） */
    price: number,
    /** 剩余库存 */
    remaining: number
}

/** 商店缓存数据，key 为商店区域名，如 "1层-商店" */
export type ShopCacheData = {
    [shopName: string]: ShopCacheItem[]
}

/** 商店库存数据库行 */
type ShopInventoryDatabase = {
    /** 商店区域名，如 "1层-商店" */
    shopName: string,
    /** 上次重置日期 */
    lastResetDate: string,
    /** 库存数据 */
    items: { name: string, remaining: number }[]
}

declare module 'koishi' {
    interface Tables {
        smm_gensokyo_shop_inventory: ShopInventoryDatabase
    }
}

/** 每个消耗类道具每日默认库存 */
const DAILY_REMAINING = 100

/** 商店售价倍率 */
const PRICE_RATE = 3

export const Shop = {
    config: {} as Config,
    ctx: {} as Context,
    /** 商店缓存数据，格式：{"1层-商店":[{name, price, remaining},...]} */
    shopTempData: {} as ShopCacheData,

    async init(config: Config, ctx: Context) {
        Shop.config = config
        Shop.ctx = ctx

        // 创建数据库表结构
        ctx.model.extend(
            'smm_gensokyo_shop_inventory',
            {
                shopName: 'string',
                lastResetDate: 'string',
                items: 'json'
            },
            {
                primary: 'shopName',
                autoInc: false
            }
        )

        // 构建商店缓存
        await Shop.loadShopCache()
    },

    /** 构建/刷新商店缓存（含每日重置逻辑） */
    async loadShopCache() {
        const today = new Date().toLocaleDateString()
        const cache: ShopCacheData = {}

        for (const floorStr of Object.keys(shopFloorData)) {
            const floor = Number(floorStr)
            const shopName = `${floor}层-商店`
            const itemNames = shopFloorData[floor]

            // 从数据库读取库存记录
            const [dbData] = await Shop.ctx.database.get('smm_gensokyo_shop_inventory', { shopName })

            // 判断是否需要重置（没有记录 或 日期不是今天）
            const needReset = !dbData || dbData.lastResetDate !== today

            let items: { name: string, remaining: number }[]
            if (needReset) {
                // 重置库存
                items = itemNames.map(name => ({ name, remaining: DAILY_REMAINING }))
                const newData: ShopInventoryDatabase = {
                    shopName,
                    lastResetDate: today,
                    items
                }
                if (dbData) {
                    await Shop.ctx.database.set('smm_gensokyo_shop_inventory', { shopName }, {
                        lastResetDate: today,
                        items
                    })
                } else {
                    await Shop.ctx.database.create('smm_gensokyo_shop_inventory', newData)
                }
            } else {
                items = dbData.items
                // 确保配置中新增的道具也有库存记录
                for (const name of itemNames) {
                    if (!items.find(i => i.name === name)) {
                        items.push({ name, remaining: DAILY_REMAINING })
                    }
                }
            }

            // 组装缓存数据（price = 道具售出价格 × 3）
            cache[shopName] = items
                .filter(i => propsData[i.name] && propsData[i.name].type === PropType.消耗类)
                .map(i => ({
                    name: i.name,
                    price: (propsData[i.name].price || 0) * PRICE_RATE,
                    remaining: i.remaining
                }))
        }

        Shop.shopTempData = cache
    },

    /** 持久化某个商店的库存到数据库 */
    async saveShopInventory(shopName: string) {
        const items = Shop.shopTempData[shopName]?.map(i => ({ name: i.name, remaining: i.remaining })) || []
        await Shop.ctx.database.set('smm_gensokyo_shop_inventory', { shopName }, {
            lastResetDate: new Date().toLocaleDateString(),
            items
        })
    },

    /** 获取用户当前所在的商店名，不在商店则返回 null */
    getUserCurrentShop(userId: string): string | null {
        const area = GensokyoMap.getUserCurrentArea(userId)
        if (!area || area.type !== AreaType.商店) return null
        return area.areaName
    },

    /** 查看商店商品列表 */
    async showShop(session: Session) {
        const shopName = Shop.getUserCurrentShop(session.userId)
        if (!shopName) {
            await Chat.send(session, '周围没有商店，无法查看商品...')
            return
        }

        // 每日重置检查
        await Shop.checkDailyReset(shopName)

        const items = Shop.shopTempData[shopName]
        if (!items || !items.length) {
            await Chat.send(session, '当前商店暂无商品出售...')
            return
        }

        const currency = Shop.config.currency
        const itemList = items.map((item, index) => {
            return `[${item.name}] ${item.price}${currency} (${item.remaining}/200)`
        }).join('\n')

        await Chat.send(session, `欢迎来到【${shopName}】，当前出售商品如下：\n\n${itemList}` +
            `\n\n购买请使用：/购买 道具名 数量\n出售请使用：/出售 道具名 数量`)
    },

    /** 购买道具 */
    async buy(session: Session, propsName: string, count: number) {
        const shopName = Shop.getUserCurrentShop(session.userId)
        if (!shopName) {
            await Chat.send(session, '周围没有商店，无法购买商品...')
            return
        }
        if (!propsName) {
            await Chat.send(session, '请输入要购买的道具名，例如：/购买 红药 1')
            return
        }
        if (!count || count < 1) count = 1

        await Shop.checkDailyReset(shopName)

        const shopItem = Shop.shopTempData[shopName]?.find(i => i.name === propsName.trim())
        if (!shopItem) {
            await Chat.send(session, `该商店没有出售【${propsName}】这个商品...`)
            return
        }
        if (shopItem.remaining < count) {
            await Chat.send(session, `库存不足！【${shopItem.name}】当前仅剩 ${shopItem.remaining} 个。`)
            return
        }

        const totalCost = shopItem.price * count
        const currency = Shop.config.currency

        // 先扣货币，成功后再给道具、减库存
        await User.lostMonetary(session.userId, totalCost, async (val) => {
            if (val.err) {
                await Chat.send(session, val.err)
                return
            }
            // 扣库存
            shopItem.remaining -= count
            await Shop.saveShopInventory(shopName)
            // 给道具
            await User.giveProps(session.userId, [{ name: shopItem.name, val: count }], async () => {
                await Chat.send(session, `购买成功！花费 ${totalCost}${currency}，获得 ${shopItem.name} ×${count}` +
                    `\n当前剩余货币：${val.currentVal}${currency}`)
            })
        })
    },

    /** 出售道具 */
    async sell(session: Session, propsName: string, count: number) {
        const shopName = Shop.getUserCurrentShop(session.userId)
        if (!shopName) {
            await Chat.send(session, '周围没有商店，无法出售商品...')
            return
        }
        if (!propsName) {
            await Chat.send(session, '请输入要出售的道具名，例如：/出售 红药 1')
            return
        }
        if (!count || count < 1) count = 1

        const name = propsName.trim()
        const propsItem = propsData[name]
        if (!propsItem) {
            await Chat.send(session, `没有找到【${name}】这个道具的信息，出售失败！`)
            return
        }

        const userProps = Props.userPorpsTemp[session.userId]
        if (!userProps || !userProps[name] || userProps[name].value < count) {
            await Chat.send(session, `道具数量不足！您当前没有足够的【${name}】可出售。`)
            return
        }

        // 出售单价 = 道具售出价格（initProps 中的 price）
        const unitPrice = propsItem.price || 0
        const totalGain = unitPrice * count
        const currency = Shop.config.currency

        // 先扣道具，成功后再给货币
        await User.loseProps(session.userId, { name, val: count }, async (val) => {
            if (val.err) {
                await Chat.send(session, val.err)
                return
            }
            await User.giveMonetary(session.userId, totalGain, async (monetaryVal) => {
                await Chat.send(session, `出售成功！卖出 ${name} ×${count}，获得 ${totalGain}${currency}` +
                    `\n当前持有货币：${monetaryVal.currentVal}${currency}`)
            })
        })
    },

    /** 检查某个商店是否需要每日重置 */
    async checkDailyReset(shopName: string) {
        const [dbData] = await Shop.ctx.database.get('smm_gensokyo_shop_inventory', { shopName })
        const today = new Date().toLocaleDateString()
        if (!dbData || dbData.lastResetDate !== today) {
            await Shop.loadShopCache()
        }
    }
}
