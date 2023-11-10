import { Scene, SceneEnter, Command, Ctx, Hears } from 'nestjs-telegraf';
import {
  INFO_SCENE_ID,
  LOYALTY_SCENE_ID,
  SWAP_SCENE_ID,
  WALLET_SCENE_ID,
} from '../../app.constants';
import { Context } from '../../interfaces/context.interface';

@Scene(INFO_SCENE_ID)
export class InfoScene {
  private msgs = [];
  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    try {
      const msg = await ctx.reply('🔎 Info', {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📚 Docs & Guides', url: 'https://docs.alfred.trade/' }],
            [
              {
                text: '💬 Support & Community',
                url: 'https://t.me/alfred_community',
              },
            ],
            [
              {
                text: '🙋‍♂️ Report a bug / request a feature',
                url: 'https://t.me/alfred_community',
              },
            ],
            [
              {
                text: '📰 News channel',
                url: 'https://twitter.com/alfred_trades',
              },
            ],
          ],
          resize_keyboard: true,
        },
      });
      this.msgs.push(msg);
      ctx.scene.state['messages'] = this.msgs;
    } catch (error) {
      console.log(error);
    }
  }

  @Command('wallet')
  @Hears(['💳 My Wallet'])
  async onWallet(@Ctx() ctx: Context): Promise<any> {
    try {
      await this.clearMsg(ctx);
      await ctx.scene.enter(WALLET_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('info')
  @Hears(['🔎 Info'])
  async onInfo(@Ctx() ctx: Context): Promise<any> {
    try {
      await this.clearMsg(ctx);
      await ctx.scene.reenter();
    } catch (error) {
      console.log(error);
    }
  }

  @Command('swap')
  @Hears(['🔁 Swap'])
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    try {
      await this.clearMsg(ctx);
      await ctx.scene.enter(SWAP_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('loyalty')
  @Hears(['🎁 Loyalty'])
  async onLoyalty(@Ctx() ctx: Context): Promise<any> {
    try {
      await this.clearMsg(ctx);
      await ctx.scene.enter(LOYALTY_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  async clearMsg(@Ctx() ctx: Context) {
    try {
      await ctx.deleteMessage();
    } catch (error) {
      console.log(error);
    }
    await this.sceneCleaner(ctx);
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
      this.msgs = [];
      ctx.scene.state['messages'] = [];
    }
  }
}
