import {
  Scene,
  SceneEnter,
  Command,
  Ctx,
  Action,
  On,
  Message,
  Hears,
} from 'nestjs-telegraf';
import {
  INFO_SCENE_ID,
  WALLET_SCENE_ID,
  SEND_SCENE_ID,
  SWAP_SCENE_ID,
  LOYALTY_SCENE_ID,
} from '../../app.constants';
import { Context } from '../../interfaces/context.interface';
import { Update } from 'telegraf/typings/core/types/typegram';

@Scene(SEND_SCENE_ID)
export class SendScene {
  private msgs = {};
  private flag = {};
  private msgPrev = {};
  private maxBal = 0;
  private address = '0x0000000000000000000000000000000000000000';

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    const chatId = ctx.chat.id;
    this.msgPrev[chatId] = ctx.scene.state['message'];
    this.msgs[chatId] = {
      mainMsg: null,
      addressMsg: null,
    };
    try {
      this.msgs[chatId].mainMsg = await ctx.reply(`↗️ Send`, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: '1.Select a currency💵', callback_data: 'nothing' }],
            [{ text: '✅ ETH', callback_data: 'nothing' }],
            [{ text: '2.Specify amount🧮', callback_data: 'nothing' }],
            [
              { text: '25%', callback_data: 'choose25' },
              { text: '50%', callback_data: 'choose50' },
              { text: '75%', callback_data: 'choose75' },
            ],
            [
              { text: '✏️Custom:--', callback_data: 'nothing' },
              { text: `✅Max: ${this.maxBal}`, callback_data: 'chooseMax' },
            ],
            [
              {
                text: `3.Specify address: ${
                  this.address.slice(0, 5) + '...' + this.address.slice(-3)
                }✏️`,
                callback_data: 'address',
              },
            ],
            [{ text: `Press for continue➡️`, callback_data: 'nothing' }],
          ],
          resize_keyboard: true,
        },
      });
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

  async clearAllMsg(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const chatId = ctx.chat.id;
    const forDelete = [];
    if (this.msgs[chatId].addressMsg) {
      console.log(this.msgs[chatId].addressMsg);
      forDelete.push(this.msgs[chatId].addressMsg);
    }
    if (this.msgs[chatId].mainMsg) {
      forDelete.push(this.msgs[chatId].mainMsg);
    }
    if (this.msgPrev[chatId]) {
      forDelete.push(this.msgPrev[chatId]);
    }
    await this.sceneCleaner(ctx, forDelete);
  }

  @Action(/choose25|choose50|choose75|chooseMax/)
  async onChoose(@Ctx() ctx: Context & { update: Update.CallbackQueryUpdate }) {
    console.log(ctx.update.callback_query);
    const data =
      'data' in ctx.update.callback_query
        ? ctx.update.callback_query.data
        : null;
    try {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: '1.Select a currency💵', callback_data: 'nothing' }],
          [{ text: '✅ ETH', callback_data: 'nothing' }],
          [{ text: '2.Specify amount🧮', callback_data: 'nothing' }],
          [
            {
              text: data === 'choose25' ? '✅25%' : '25%',
              callback_data: 'choose25',
            },
            {
              text: data === 'choose50' ? '✅50%' : '50%',
              callback_data: 'choose50',
            },
            {
              text: data === 'choose75' ? '✅75%' : '75%',
              callback_data: 'choose75',
            },
          ],
          [
            { text: '✏️Custom:--', callback_data: 'nothing' },
            {
              text:
                data === 'chooseMax'
                  ? `✅Max: ${this.maxBal}`
                  : `Max: ${this.maxBal}`,
              callback_data: 'chooseMax',
            },
          ],
          [
            {
              text: `3.Specify address: ${
                this.address.slice(0, 5) + '...' + this.address.slice(-3)
              }✏️`,
              callback_data: 'address',
            },
          ],
          [{ text: `Press for continue➡️`, callback_data: 'nothing' }],
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/address/)
  async onAddress(
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    const data =
      'data' in ctx.update.callback_query
        ? ctx.update.callback_query.data
        : null;
    const chatId = ctx.callbackQuery.message.chat.id;
    this.flag[chatId] = data;

    if (this.msgs[chatId].addressMsg) {
      await ctx.deleteMessage(this.msgs[chatId].addressMsg.message_id);
    }
    this.msgs[chatId].addressMsg = await ctx.reply(
      'Send your wallet address in a text message here:',
    );
  }

  @Action(/refresh|back/)
  async onRefresh(
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.enter(WALLET_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @On('text')
  async onMsg(
    @Message('text') msg: string,
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    await ctx.deleteMessage();
    const chatId = ctx.chat.id;
    if (this.flag[chatId] === 'address') {
      this.address = msg;
      try {
        if (this.msgs[chatId].addressMsg) {
          await ctx.deleteMessage(this.msgs[chatId].addressMsg.message_id);
        }
        if (this.msgs[chatId].mainMsg) {
          await ctx.deleteMessage(this.msgs[chatId].mainMsg.message_id);
        }
        this.flag[chatId] = null;
        await ctx.scene.reenter();
      } catch (error) {
        console.log(error);
      }
    }
  }

  async sceneCleaner(@Ctx() ctx: Context, deleteArr: any[]) {
    if (deleteArr.length) {
      for (const { message_id: id } of deleteArr) {
        try {
          console.log(id);
          await ctx.deleteMessage(id);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
}
