import { Command, Ctx, Hears, Start, Update, Sender } from 'nestjs-telegraf';
import { UpdateType as TelegrafUpdateType } from 'telegraf/typings/telegram-types';
import { Context } from '../interfaces/context.interface';
import {
  INFO_SCENE_ID,
  WALLET_SCENE_ID,
  LOYALTY_SCENE_ID,
  SWAP_SCENE_ID,
} from '../app.constants';
import { UpdateType } from '../common/decorators/update-type.decorator';

@Update()
export class BotUpdate {
  @Start()
  async onStart(
    @UpdateType() updateType: TelegrafUpdateType,
    @Sender('first_name') firstName: string,
    @Ctx() ctx: Context,
  ): Promise<any> {
    try {
      await ctx.replyWithAnimation(
        { source: './src/common/startVideo.mp4' },
        {
          caption: `
Hey ${firstName},

I'm Alfred, your trusted trading assistant. I'm here to provide you with comprehensive support for all your trading needs.

💼 My wallet address:
<code>0xF68db204C370B4E463f772EA17C8dC45EA251b13</code>

💎 My referral link:
https://t.me/AlfredTradesBot?start=nG3CMxv   

Go to /swap to start trading or /wallet to manage you balances.

Join our community (<a href="https://t.me/alfred_community">community</a>).
      `,
          parse_mode: 'HTML',
          reply_markup: {
            keyboard: [
              [{ text: '🔁 Swap' }, { text: '💳 My Wallet' }],
              [{ text: '🎁 Loyalty' }, { text: '🔎 Info' }],
            ],
            resize_keyboard: true,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Command('wallet')
  @Hears(['💳 My Wallet'])
  async onWallet(@Ctx() ctx: Context): Promise<any> {
    try {
      await ctx.deleteMessage();
      await ctx.scene.enter(WALLET_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('info')
  @Hears(['🔎 Info'])
  async onInfo(@Ctx() ctx: Context): Promise<any> {
    try {
      await ctx.deleteMessage();
      await ctx.scene.enter(INFO_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('loyalty')
  @Hears(['🎁 Loyalty'])
  async onLoyalty(@Ctx() ctx: Context): Promise<any> {
    try {
      await ctx.deleteMessage();
      await ctx.scene.enter(LOYALTY_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('swap')
  @Hears(['🔁 Swap'])
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    try {
      await ctx.deleteMessage();
      await ctx.scene.enter(SWAP_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('settings')
  async onSettings(@Ctx() ctx: Context): Promise<any> {
    try {
      await ctx.deleteMessage();
      await ctx.reply(`⚠️ Settings is under construction ⚠️`);
    } catch (error) {
      console.log(error);
    }
  }

  @Command('menu')
  async onMenu(
    @UpdateType() updateType: TelegrafUpdateType,
    @Sender('first_name') firstName: string,
    @Ctx() ctx: Context,
  ): Promise<any> {
    try {
      await ctx.deleteMessage();
      await ctx.reply(
        `
Hey ${firstName},

I'm Alfred, your trusted trading assistant. I'm here to provide you with comprehensive support for all your trading needs.

💼 My wallet address:
<code>0xF68db204C370B4E463f772EA17C8dC45EA251b13</code>

💎 My referral link:
https://t.me/AlfredTradesBot?start=nG3CMxv   

Go to /swap to start trading or /wallet to manage you balances.

Join our community (<a href="https://t.me/alfred_community">community</a>).
      `,
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            keyboard: [
              [{ text: '🔁 Swap' }, { text: '💳 My Wallet' }],
              [{ text: '🎁 Loyalty' }, { text: '🔎 Info' }],
            ],
            resize_keyboard: true,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }
}
