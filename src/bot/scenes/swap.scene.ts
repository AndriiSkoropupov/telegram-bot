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
  private msgs = {};

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    const chatId = ctx.message.chat.id;
    this.msgs[chatId] = {
      buyMsg: null,
      sellMsg: null,
      sniperMsg: null,
      mainMsg: null,
    };
    try {
      this.msgs[chatId].mainMsg = await ctx.reply(
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
      await ctx.scene.enter(LOYALTY_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('swap')
  @Hears(['🔁 Swap'])
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.reenter();
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/buy/)
  async onBuy(@Ctx() ctx: Context) {
    await this.clearMsg(ctx);
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      this.msgs[chatId].buyMsg = await ctx.reply(
        'Send the address of a token you want to buy:',
      );
    } catch (error) {
      console.log(error);
    }
  }

  async clearAllMsg(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const chatId = ctx.chat.id;
    const forDelete = [];
    if (this.msgs[chatId].buyMsg) {
      forDelete.push(this.msgs[chatId].buyMsg);
      this.msgs[chatId].buyMsg = null;
    }
    if (this.msgs[chatId].sellMsg) {
      forDelete.push(this.msgs[chatId].sellMsg);
      this.msgs[chatId].sellMsg = null;
    }
    if (this.msgs[chatId].sniperMsg) {
      forDelete.push(this.msgs[chatId].sniperMsg);
      this.msgs[chatId].sniperMsg = null;
    }
    if (this.msgs[chatId].mainMsg) {
      forDelete.push(this.msgs[chatId].mainMsg);
      this.msgs[chatId].mainMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
  }

  async clearMsg(@Ctx() ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      const forDelete = [];
      if (this.msgs[chatId].buyMsg) {
        forDelete.push(this.msgs[chatId].buyMsg);
        this.msgs[chatId].buyMsg = null;
      }
      if (this.msgs[chatId].sellMsg) {
        forDelete.push(this.msgs[chatId].sellMsg);
        this.msgs[chatId].sellMsg = null;
      }
      if (this.msgs[chatId].sniperMsg) {
        forDelete.push(this.msgs[chatId].sniperMsg);
        this.msgs[chatId].sniperMsg = null;
      }
      if (forDelete.length > 0) {
        ctx.scene.state['messages'] = forDelete;
        await this.sceneCleaner(ctx);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/sell/)
  async onSell(@Ctx() ctx: Context) {
    await this.clearMsg(ctx);
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      this.msgs[chatId].sellMsg = await ctx.reply(
        'Please import at least one token with none-zero balance',
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/sniper/)
  async onSniper(@Ctx() ctx: Context) {
    await this.clearMsg(ctx);
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      this.msgs[chatId].sniperMsg = await ctx.reply(
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
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/back/)
  async onBack(@Ctx() ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      if (this.msgs[chatId].sniperMsg) {
        await ctx.deleteMessage(this.msgs[chatId].sniperMsg.message_id);
        this.msgs[chatId].sniperMsg = null;
      }
    } catch (error) {
      console.log(error);
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
