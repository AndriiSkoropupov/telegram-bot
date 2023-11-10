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

@Scene(SWAP_SCENE_ID)
export class SwapScene {
  private buyMsg = null;
  private sellMsg = null;
  private sniperMsg = null;
  private mainMsg = null;

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    // this.sceneCleaner(ctx);
    this.mainMsg = await ctx.reply(
      `
🔁 Swap

<code>0xF68db204C370B4E463f772EA17C8dC45EA251b13</code>

🔗 Ethereum
    
🔹 <a href="https://etherscan.io/address/0xF68db204C370B4E463f772EA17C8dC45EA251b13">Etherscan</a>  | 🔸 <a href="https://debank.com/profile/0xF68db204C370B4E463f772EA17C8dC45EA251b13">DeBank</a> ,
    `,
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📈Buy', callback_data: 'buy' },
              { text: '📉Sell', callback_data: 'sell' },
            ],
            [{ text: '🎯Sniper', callback_data: 'sniper' }],
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
    if (this.buyMsg) {
      forDelete.push(this.buyMsg);
      this.buyMsg = null;
    }
    if (this.sellMsg) {
      forDelete.push(this.sellMsg);
      this.sellMsg = null;
    }
    if (this.sniperMsg) {
      forDelete.push(this.sniperMsg);
      this.sniperMsg = null;
    }
    if (this.mainMsg) {
      forDelete.push(this.mainMsg);
      this.mainMsg = null;
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
    if (this.buyMsg) {
      forDelete.push(this.buyMsg);
      this.buyMsg = null;
    }
    if (this.sellMsg) {
      forDelete.push(this.sellMsg);
      this.sellMsg = null;
    }
    if (this.sniperMsg) {
      forDelete.push(this.sniperMsg);
      this.sniperMsg = null;
    }
    if (this.mainMsg) {
      forDelete.push(this.mainMsg);
      this.mainMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
    await ctx.scene.enter(WALLET_SCENE_ID);
  }

  @Command('loyalty')
  @Hears(['🎁 Loyalty'])
  async onLoyalty(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    const forDelete = [];
    if (this.buyMsg) {
      forDelete.push(this.buyMsg);
      this.buyMsg = null;
    }
    if (this.sellMsg) {
      forDelete.push(this.sellMsg);
      this.sellMsg = null;
    }
    if (this.sniperMsg) {
      forDelete.push(this.sniperMsg);
      this.sniperMsg = null;
    }
    if (this.mainMsg) {
      forDelete.push(this.mainMsg);
      this.mainMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
    await ctx.scene.enter(LOYALTY_SCENE_ID);
  }

  @Action(/buy/)
  async onBuy(@Ctx() ctx: Context) {
    if (this.buyMsg) {
      await ctx.deleteMessage(this.buyMsg.message_id);
      this.buyMsg = null;
    }
    if (this.sellMsg) {
      await ctx.deleteMessage(this.sellMsg.message_id);
      this.sellMsg = null;
    }
    if (this.sniperMsg) {
      await ctx.deleteMessage(this.sniperMsg.message_id);
      this.sniperMsg = null;
    }
    this.buyMsg = await ctx.reply(
      'Send the address of a token you want to buy:',
    );
  }

  @Action(/sell/)
  async onSell(@Ctx() ctx: Context) {
    if (this.buyMsg) {
      await ctx.deleteMessage(this.buyMsg.message_id);
      this.buyMsg = null;
    }
    if (this.sellMsg) {
      await ctx.deleteMessage(this.sellMsg.message_id);
      this.sellMsg = null;
    }
    if (this.sniperMsg) {
      await ctx.deleteMessage(this.sniperMsg.message_id);
      this.sniperMsg = null;
    }
    this.sellMsg = await ctx.reply(
      'Please import at least one token with none-zero balance',
    );
  }

  @Action(/sniper/)
  async onSniper(@Ctx() ctx: Context) {
    if (this.buyMsg) {
      await ctx.deleteMessage(this.buyMsg.message_id);
      this.buyMsg = null;
    }
    if (this.sellMsg) {
      await ctx.deleteMessage(this.sellMsg.message_id);
      this.sellMsg = null;
    }
    if (this.sniperMsg) {
      await ctx.deleteMessage(this.sniperMsg.message_id);
      this.sniperMsg = null;
    }
    this.sniperMsg = await ctx.reply(
      'Here you can create a new snipe or manage the existing ones.',
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎯Create a new snipe', callback_data: 'create' }],
            [{ text: '< Back', callback_data: 'back' }],
          ],
          resize_keyboard: true,
        },
      },
    );
  }

  @Action(/back/)
  async onBack(@Ctx() ctx: Context) {
    if (this.sniperMsg) {
      await ctx.deleteMessage(this.sniperMsg.message_id);
      this.sniperMsg = null;
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
