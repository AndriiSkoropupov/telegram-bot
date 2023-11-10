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
  private leaderMsg = null;
  private referralMsg = null;

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    // this.sceneCleaner(ctx);
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
  }

  @Hears(['🔎 Info'])
  @Command('info')
  async onInfo(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    const forDelete = [];
    if (this.leaderMsg) {
      forDelete.push(this.leaderMsg);
      this.leaderMsg = null;
    }
    if (this.referralMsg) {
      forDelete.push(this.referralMsg);
      this.referralMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
    await ctx.scene.enter(INFO_SCENE_ID);
  }

  @Command('wallet')
  @Hears(['💳 My Wallet'])
  async onWallet(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    const forDelete = [];
    if (this.leaderMsg) {
      forDelete.push(this.leaderMsg);
      this.leaderMsg = null;
    }
    if (this.referralMsg) {
      forDelete.push(this.referralMsg);
      this.referralMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
    await ctx.scene.enter(WALLET_SCENE_ID);
  }

  @Command('swap')
  @Hears(['🔁 Swap'])
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    const forDelete = [];
    if (this.leaderMsg) {
      forDelete.push(this.leaderMsg);
      this.leaderMsg = null;
    }
    if (this.referralMsg) {
      forDelete.push(this.referralMsg);
      this.referralMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
    await ctx.scene.enter(SWAP_SCENE_ID);
  }

  @Action(/leaderboard/)
  async onLeaderboard(@Ctx() ctx: Context) {
    if (this.leaderMsg) {
      await ctx.deleteMessage(this.leaderMsg.message_id);
      this.leaderMsg = null;
    }
    if (this.referralMsg) {
      await ctx.deleteMessage(this.referralMsg.message_id);
      this.referralMsg = null;
    }
    this.leaderMsg = await ctx.reply('Coming soon 👀');
  }

  @Action(/referral/)
  async onReferral(@Ctx() ctx: Context) {
    if (this.leaderMsg) {
      await ctx.deleteMessage(this.leaderMsg.message_id);
      this.leaderMsg = null;
    }
    if (this.referralMsg) {
      await ctx.deleteMessage(this.referralMsg.message_id);
      this.referralMsg = null;
    }
    this.referralMsg = await ctx.reply(
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
  }

  @Action(/back/)
  async onBack(@Ctx() ctx: Context) {
    if (this.referralMsg) {
      await ctx.deleteMessage(this.referralMsg.message_id);
      this.referralMsg = null;
    }
  }

  async sceneCleaner(@Ctx() ctx: Context) {
    if (ctx.scene.state['messages']) {
      ctx.scene.state['messages'].forEach(({ message_id: id }) => {
        try {
          console.log(id);
          ctx.deleteMessage(id);
        } catch (error) {
          console.log(error);
        }
      });
      ctx.scene.state['messages'] = [];
    }
  }
}
