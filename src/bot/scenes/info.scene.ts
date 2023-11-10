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
    const msg = await ctx.reply('🔎 Info', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📚 Docs & Guides', url: 'https://docs.alfred.trade/' }],
          [{ text: '💬 Support & Community', url: 'https://t.me/alfred_community' }],
          [{ text: '🙋‍♂️ Report a bug / request a feature', url: 'https://t.me/alfred_community' }],
          [{ text: '📰 News channel', url: 'https://twitter.com/alfred_trades' }],
        ],
        resize_keyboard: true,
      },
    });
    this.msgs.push(msg);
    ctx.scene.state['messages'] = this.msgs;
  }

  @Command('wallet')
  @Hears(['💳 My Wallet'])
  async onWallet(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(WALLET_SCENE_ID);
  }

  @Command('swap')
  @Hears(['🔁 Swap'])
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(SWAP_SCENE_ID);
  }

  @Command('loyalty')
  @Hears(['🎁 Loyalty'])
  async onLoyalty(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(LOYALTY_SCENE_ID);
  }

  async sceneCleaner(@Ctx() ctx: Context){
    if (ctx.scene.state['messages']) {
      ctx.scene.state['messages'].forEach(({ message_id: id }) => {
        try {
          console.log(id);
          ctx.deleteMessage(id);
        } catch (error) {
          console.log(error);
        }
      });
      this.msgs = [];
      ctx.scene.state['messages'] = [];
    }
  }
}
