import { Context, Schema } from 'koishi'
import type { } from 'koishi-plugin-monetary'
import { AreaType, GensokyoMap, MoveType } from './map';
import { User } from './users';
import { Monster } from './monster';
import { BattleData } from './battle';
import { random } from './utlis';
import { skillFn } from './data/skillFn';
import { Props } from './props';
export const name = 'smmcat-gensokyo'

export const inject = {
  required: ['monetary', 'database']
};

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context, config: Config) {

  ctx.on('ready', () => {
    GensokyoMap.init(config, ctx)
    User.init(config, ctx)
    Monster.init(config, ctx)
    Props.init(config, ctx)
  })

  ctx
    .command('幻想乡')
  ctx
    .command('幻想乡/移动.上')
    .action(async ({ session }) => {
      console.log(session.userId.slice(0, 6) + '触发了上移动');
      const userData = await User.getUserAttribute(session)
      if (!userData) return

      GensokyoMap.initUserPoistion(session, userData)
      if (BattleData.isBattle(session)) {
        await session.send('您正在战斗中，无法移动！')
        return
      }
      if (User.isDie(session.userId)) {
        return `你已经阵亡，请发送 /补给 进行治疗。`
      }
      GensokyoMap.move(session, MoveType.上, async (val) => {
        await session.send(GensokyoMap.userAreaTextFormat(userData.playName, val))
        // 概率遇到怪物
        if (val.map.type == AreaType.冒险区 && val.map.monster?.length) {
          if (random(0, 10) <= 2) {
            const selectMonster = val.map.monster[random(0, val.map.monster.length)]
            await session.send(`糟糕！你被 Lv.${selectMonster.lv} ${selectMonster.name} 发现，强制开启战斗！`)
            await BattleData.createBattleByMonster(session, [selectMonster])
          }
        }
      })
    })
  ctx
    .command('幻想乡/移动.下')
    .action(async ({ session }) => {
      console.log(session.userId.slice(0, 6) + '触发了下移动');
      const userData = await User.getUserAttribute(session)
      if (!userData) return

      GensokyoMap.initUserPoistion(session, userData)
      if (BattleData.isBattle(session)) {
        await session.send('您正在战斗中，无法移动！')
        return
      }
      if (User.isDie(session.userId)) {
        return `你已经阵亡，请发送 /补给 进行治疗。`
      }
      GensokyoMap.move(session, MoveType.下, async (val) => {
        await session.send(GensokyoMap.userAreaTextFormat(userData.playName, val))
        // 概率遇到怪物
        if (val.map.type == AreaType.冒险区 && val.map.monster?.length) {
          if (random(0, 10) <= 2) {
            const selectMonster = val.map.monster[random(0, val.map.monster.length)]
            await session.send(`糟糕！你被 Lv.${selectMonster.lv} ${selectMonster.name} 发现，强制发生战斗！`)
            await BattleData.createBattleByMonster(session, [selectMonster])
          }
        }
      })
    })
  ctx
    .command('幻想乡/移动.左')
    .action(async ({ session }) => {
      console.log(session.userId.slice(0, 6) + '触发了左移动');
      const userData = await User.getUserAttribute(session)
      if (!userData) return

      GensokyoMap.initUserPoistion(session, userData)
      if (BattleData.isBattle(session)) {
        await session.send('您正在战斗中，无法移动！')
        return
      }
      if (User.isDie(session.userId)) {
        return `你已经阵亡，请发送 /补给 进行治疗。`
      }
      GensokyoMap.move(session, MoveType.左, async (val) => {
        await session.send(GensokyoMap.userAreaTextFormat(userData.playName, val))
        // 概率遇到怪物
        if (val.map.type == AreaType.冒险区 && val.map.monster?.length) {
          if (random(0, 10) <= 2) {
            const selectMonster = val.map.monster[random(0, val.map.monster.length)]
            await session.send(`糟糕！你被 Lv.${selectMonster.lv} ${selectMonster.name} 发现，强制发生战斗！`)
            await BattleData.createBattleByMonster(session, [selectMonster])
          }
        }
      })
    })
  ctx
    .command('幻想乡/移动.右')
    .action(async ({ session }) => {
      console.log(session.userId.slice(0, 6) + '触发了右移动');
      const userData = await User.getUserAttribute(session)
      if (!userData) return

      GensokyoMap.initUserPoistion(session, userData)
      if (BattleData.isBattle(session)) {
        await session.send('您正在战斗中，无法移动！')
        return
      }
      if (User.isDie(session.userId)) {
        return `你已经阵亡，请发送 /补给 进行治疗。`
      }
      GensokyoMap.move(session, MoveType.右, async (val) => {
        await session.send(GensokyoMap.userAreaTextFormat(userData.playName, val))
        // 概率遇到怪物
        if (val.map.type == AreaType.冒险区 && val.map.monster?.length) {
          if (random(0, 10) <= 2) {
            const selectMonster = val.map.monster[random(0, val.map.monster.length)]
            await session.send(`糟糕！你被 Lv.${selectMonster.lv} ${selectMonster.name} 发现，强制发生战斗！`)
            await BattleData.createBattleByMonster(session, [selectMonster])
          }
        }
      })
    })
  ctx
    .command('幻想乡/位置')
    .action(async ({ session }) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      GensokyoMap.initUserPoistion(session, userData)
      const query = {
        user: GensokyoMap.userCurrentLoal[session.userId],
        map: GensokyoMap.getUserCurrentArea(session.userId)
      }
      if (!query.map) {
        return `无效区域`
      }
      await session.send(GensokyoMap.userAreaTextFormat(userData.playName, query))
    })

  ctx
    .command('幻想乡/个人属性')
    .action(async ({ session }) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      GensokyoMap.initUserPoistion(session, userData)
      return `您的属性如下：\n` + User.userAttributeTextFormat(session.userId)
    })

  ctx
    .command('幻想乡/个人道具')
    .action(async ({ session }) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      GensokyoMap.initUserPoistion(session, userData)
      return await Props.getPropsDataByUserId(session.userId)
    })

  ctx
    .command('幻想乡/个人信息').userFields(['id'])
    .action(async ({ session }) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      GensokyoMap.initUserPoistion(session, userData)
      const [data] = await ctx.database.get('monetary', { uid: session.user.id })
      return `[${User.userTempData[session.userId].playName}]：您当前货币为：${data?.value || 0}个`
    })

  ctx
    .command('幻想乡/开始注册')
    .action(async ({ session }) => {
      await User.createPlayUser(session)
    })

  ctx
    .command('幻想乡/查询怪物 <monster> <lv:posint>')
    .action(async ({ session }, monster, lv) => {
      if (!monster) return `请输入要查询的怪物！`
      if (!lv) lv = 1
      const result = Monster.getMonsterAttributeData(monster, lv)
      if (!result) return `没有找到该怪物信息...`
      return Monster.monsterAttributeTextFormat(result)
    })

  // ctx
  //   .command('给我药')
  //   .action(async ({ session }) => {
  //     await session.send('稍等...')
  //     await User.giveProps(session.userId, [{ name: '红药', val: 99999 }], async (val) => {
  //       if (val.err) {
  //         session.send(val.err)
  //         return
  //       }
  //       await session.send('获取成功')
  //     })
  //   })

  ctx
    .command('幻想乡/打怪遇敌 <goal>')
    .action(async ({ session }, goal) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return

      GensokyoMap.initUserPoistion(session, userData)
      if (User.isDie(session.userId)) {
        return `你已经阵亡，请发送 /补给 进行治疗。`
      }
      const areaInfo = GensokyoMap.getUserCurrentArea(session.userId)
      if (goal) {
        if (!areaInfo.monster?.map(i => i.name).includes(goal)) {
          return `没有在该区域找到该怪物。`
        }
        const selectMonster = areaInfo.monster.find(i => i.name == goal)
        await BattleData.createBattleByMonster(session, [selectMonster])
      } else {
        const selectMonster = areaInfo.monster
        await BattleData.createBattleByMonster(session, selectMonster)
      }
    })

  ctx
    .command('幻想乡/打怪攻击 <goal>')
    .action(async ({ session }, goal) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      BattleData.play(session, '普攻', goal)
    })

  ctx
    .command('幻想乡/打怪技能 <skill> <goal>')
    .action(async ({ session }, skill, goal) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      BattleData.play(session, skill, goal)
    })

  ctx
    .command('幻想乡/打怪pk <goal>')
    .action(async ({ session }, goal) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      GensokyoMap.initUserPoistion(session, userData)
      if (User.isDie(session.userId)) {
        return `你已经阵亡，请发送 /补给 进行治疗。`
      }
      if (!goal) {
        await session.send('请选择PK目标！')
        return
      }
      const nearUserItem = GensokyoMap.nearbyPlayersByUserId(session.userId)
      const exist = nearUserItem.find((item) => item.playName == goal.trim())
      if (!exist) {
        await session.send(`PK失败，当前区域未存在【${goal}】玩家`)
        return
      }
      if (User.isDie(exist.userId)) {
        return `目标已经阵亡，请更换PK目标对象...`
      }
      if (BattleData.isTeamByUserId(exist.userId)) {
        const teamItem = BattleData.teamListByUser(exist.userId)
        await session.send(`对方有组队，您将扮演攻击方与对方队伍进行战斗。`)
        await BattleData.createBattleByUser(session, teamItem.map((item) => ({ userId: item.userId })))
      }
      else {
        await session.send(`您将扮演攻击方与对方进行战斗。`)
        await BattleData.createBattleByUser(session, [{ userId: exist.userId }])
      }
    })

  ctx
    .command('幻想乡/道具使用 <props>')
    .action(async ({ session }, props) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      GensokyoMap.initUserPoistion(session, userData)

      if (!props) {
        return `未选择道具使用，请选择道具，例如：/道具使用 红药`
      }
      await Props.userProps(session, props)
    })
  ctx
    .command('幻想乡/技能查询 <goal>')
    .action(async ({ session }, goal) => {
      if (!goal) return `请输入技能名，例如 /技能查询 重砍`
      if (!skillFn[goal]) return `没有存在 ${goal} 技能！`
      return `[${goal}]信息如下：\n` + skillFn[goal].info
    })


  const temp = {}
  ctx
    .command('幻想乡/补给')
    .action(async ({ session }) => {
      const userData = await User.getUserAttribute(session)
      if (!userData) return
      GensokyoMap.initUserPoistion(session, userData)
      if (temp[session.userId] == undefined) {
        temp[session.userId] = 0
      }
      const useTime = Date.now() - temp[session.userId]
      if (useTime < 360000) {
        return `请等待下一个补给时间！剩余${Math.floor(360000 - (useTime / 60000))}分钟。`
      }
      temp[session.userId] = Date.now()
      const { maxHp, maxMp, playName } = User.getUserAttributeByUserId(session.userId)
      console.log(maxMp);

      User.userTempData[session.userId].hp = maxHp
      User.userTempData[session.userId].mp = maxMp
      User.userTempData[session.userId].isDie = false
      console.log(User.userTempData[session.userId]);

      await User.setDatabaseUserAttribute(session.userId)
      return playName + `通过补给，目前已恢复HP和MP`
    })

  ctx
    .command('幻想乡/队伍操作')

  ctx
    .command('队伍操作/队伍创建')
    .action(async ({ session }) => {
      await BattleData.creatTeam(session)
    })
  ctx
    .command('队伍操作/队伍信息')
    .action(async ({ session }) => {
      const team = BattleData.teamListByUser(session.userId)
      if (!team.length) return `你还没有队伍...`
      return team.map((item) => `lv.${item.lv} ${item.playName} [${BattleData.teamTemp[item.userId].identity}]`).join('\n')
    })
  ctx
    .command('队伍操作/队伍邀请 <playName>')
    .action(async ({ session }, playName) => {
      if (!playName) {
        return `请选择需要邀请的玩家昵称。例如 /队伍邀请 夜夜酱`
      }
      await BattleData.invitationTeam(session, playName)
    })

  ctx
    .command('队伍操作/队伍加入')
    .action(async ({ session }) => {
      await BattleData.joinTeam(session)
    })
  ctx
    .command('队伍操作/队伍退出')
    .action(async ({ session }) => {
      await BattleData.exitTeam(session)
    })
  ctx
    .command('队伍操作/队伍解散')
    .action(async ({ session }) => {
      await BattleData.dissolveTeam(session)
    })
}
