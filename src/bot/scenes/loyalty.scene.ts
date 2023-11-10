import {
  Scene,
  SceneEnter,
  Command,
  Ctx,
  Action,
  Hears,
} from 'nestjs-telegraf';
import {
  INFO_SCENE_ID,
  WALLET_SCENE_ID,
  LOYALTY_SCENE_ID,
  SWAP_SCENE_ID,
} from '../../app.constants';
import { Context } from '../../interfaces/context.interface';

@Scene(LOYALTY_SCENE_ID)
export class LoyaltyScene {
  private msgs = {};

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    this.msgs[ctx.message.chat.id] = {
      leaderMsg: null,
      referralMsg: null,
    };
    try {
      await ctx.reply(
        `
🎁 Loyalty

The more active you are, the more 
points you earn. <a href="https://alfred-documentation.gitbook.io/alfred-documentation/points-and-rev-share/loyalty-points">Learn More</a>

Tier level: Chef

💰 Total points earned: <code>0</code>
🥇 Rank: <code>14455</code>
🪄 Fee reduction: <code>0</code>%
🎯 Current multiplier: <code>x1</code>

☆☆☆☆☆☆☆☆☆☆ Butler (0%)    
    `,
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{ text: '💎Referral', callback_data: 'referral' }],
              [{ text: '🏆Leaderboard', callback_data: 'leaderboard' }],
            ],
            resize_keyboard: true,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Hears(['🔎 Info'])
  @Command('info')
  async onInfo(@Ctx() ctx: Context): Promise<any> {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.enter(INFO_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('wallet')
  @Hears(['💳 My Wallet'])
  async onWallet(@Ctx() ctx: Context): Promise<any> {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.enter(WALLET_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('loyalty')
  @Hears(['🎁 Loyalty'])
  async onLoyalty(@Ctx() ctx: Context): Promise<any> {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.reenter();
    } catch (error) {
      console.log(error);
    }
  }

  @Command('swap')
  @Hears(['🔁 Swap'])
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.enter(SWAP_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  async clearAllMsg(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const chatId = ctx.chat.id;
    const forDelete = [];
    if (this.msgs[chatId].leaderMsg) {
      forDelete.push(this.msgs[chatId].leaderMsg);
      this.msgs[chatId].leaderMsg = null;
    }
    if (this.msgs[chatId].referralMsg) {
      forDelete.push(this.msgs[chatId].referralMsg);
      this.msgs[chatId].referralMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
  }

  async clearMsg(@Ctx() ctx: Context) {
    // await ctx.deleteMessage();
    const chatId = ctx.chat.id;
    const forDelete = [];
    if (this.msgs[chatId].leaderMsg) {
      forDelete.push(this.msgs[chatId].leaderMsg);
      this.msgs[chatId].leaderMsg = null;
    }
    if (this.msgs[chatId].referralMsg) {
      forDelete.push(this.msgs[chatId].referralMsg);
      this.msgs[chatId].referralMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
  }

  @Action(/leaderboard/)
  async onLeaderboard(@Ctx() ctx: Context) {
    await this.clearMsg(ctx);
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      this.msgs[chatId].leaderMsg = await ctx.reply('Coming soon 👀');
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/referral/)
  async onReferral(@Ctx() ctx: Context) {
    await this.clearMsg(ctx);
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      this.msgs[chatId].referralMsg = await ctx.reply(
        `
💎 Referral

My referral link:
https://t.me/AlfredTradesBot?start=nG3CMxv

You get <code>25</code>% of referres' points forever. The 
reffered users instantly gain <code>Tier 2</code> with <code>5%</code> Fee reduction

👥 My referrals: <code>0</code>
🌟 Extra points from referrals: <code>0</code>  
    `,
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[{ text: '< Back', callback_data: 'back' }]],
            resize_keyboard: true,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/back/)
  async onBack(@Ctx() ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id;
    if (this.msgs[chatId].referralMsg) {
      try {
        await ctx.deleteMessage(this.msgs[chatId].referralMsg.message_id);
      } catch (error) {
        console.log(error);
      }
      this.msgs[chatId].referralMsg = null;
    }
  }

  async sceneCleaner(@Ctx() ctx: Context) {
    if (ctx.scene.state['messages']) {
      for (const { message_id: id } of ctx.scene.state['messages']) {
        try {
          await ctx.deleteMessage(id);
        } catch (error) {
          console.log(error);
        }
      }
      ctx.scene.state['messages'] = [];
    }
  }
}
