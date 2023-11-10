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
  private msgs = [];
  private msgPrev = null;
  private maxBal = 0;
  private address = '0x0000000000000000000000000000000000000000';

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    // this.sceneCleaner(ctx);
    this.msgPrev = ctx.scene.state['message'];
    const msg = await ctx.reply(`↗️ Send`, {
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
    this.msgs.push(msg);
    ctx.scene.state['messages'] = this.msgs;
  }

  @Hears(['🔎 Info'])
  @Command('info')
  async onInfo(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    ctx.scene.state['messages'] = [...this.msgs, this.msgPrev];
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(INFO_SCENE_ID);
  }

  @Command('wallet')
  @Hears(['💳 My Wallet'])
  async onWallet(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    ctx.scene.state['messages'] = [...this.msgs, this.msgPrev];
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(WALLET_SCENE_ID);
  }

  @Command('swap')
  @Hears(['🔁 Swap'])
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    ctx.scene.state['messages'] = [...this.msgs, this.msgPrev];
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(SWAP_SCENE_ID);
  }

  @Command('loyalty')
  @Hears(['🎁 Loyalty'])
  async onLoyalty(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    ctx.scene.state['messages'] = [...this.msgs, this.msgPrev];
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(LOYALTY_SCENE_ID);
  }

  @Action(/choose25|choose50|choose75|chooseMax/)
  async onChoose(@Ctx() ctx: Context & { update: Update.CallbackQueryUpdate }) {
    console.log(ctx.update.callback_query);
    const data =
      'data' in ctx.update.callback_query
        ? ctx.update.callback_query.data
        : null;
    if (data === 'choose25') {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: '1.Select a currency💵', callback_data: 'nothing' }],
          [{ text: '✅ ETH', callback_data: 'nothing' }],
          [{ text: '2.Specify amount🧮', callback_data: 'nothing' }],
          [
            { text: '✅25%', callback_data: 'choose25' },
            { text: '50%', callback_data: 'choose50' },
            { text: '75%', callback_data: 'choose75' },
          ],
          [
            { text: '✏️Custom:--', callback_data: 'nothing' },
            { text: `Max: ${this.maxBal}`, callback_data: 'chooseMax' },
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
    } else if (data === 'choose75') {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: '1.Select a currency💵', callback_data: 'nothing' }],
          [{ text: '✅ ETH', callback_data: 'nothing' }],
          [{ text: '2.Specify amount🧮', callback_data: 'nothing' }],
          [
            { text: '25%', callback_data: 'choose25' },
            { text: '50%', callback_data: 'choose50' },
            { text: '✅75%', callback_data: 'choose75' },
          ],
          [
            { text: '✏️Custom:--', callback_data: 'nothing' },
            { text: `Max: ${this.maxBal}`, callback_data: 'chooseMax' },
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
    } else if (data === 'choose50') {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: [
          [{ text: '1.Select a currency💵', callback_data: 'nothing' }],
          [{ text: '✅ ETH', callback_data: 'nothing' }],
          [{ text: '2.Specify amount🧮', callback_data: 'nothing' }],
          [
            { text: '25%', callback_data: 'choose25' },
            { text: '✅50%', callback_data: 'choose50' },
            { text: '75%', callback_data: 'choose75' },
          ],
          [
            { text: '✏️Custom:--', callback_data: 'nothing' },
            { text: `Max: ${this.maxBal}`, callback_data: 'chooseMax' },
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
    } else if (data === 'chooseMax') {
      await ctx.editMessageReplyMarkup({
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
      });
    }
    console.log(ctx.scene.state['choose']);
  }

  @Action(/address/)
  async onAddress(
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    const data =
      'data' in ctx.update.callback_query
        ? ctx.update.callback_query.data
        : null;
    console.log(ctx.update.callback_query);
    if (data === 'address') {
      const sendMsg = await ctx.reply(
        'Send your wallet address in a text message here:',
      );
      this.msgs.push(sendMsg);
      ctx.scene.state['messages'] = this.msgs;
      ctx.scene.state['callback'] = 'address';
    }
  }

  // @Action(/refresh|back/)
  // async onRefresh(
  //   @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  // ) {
  //   ctx.deleteMessage();
  //   ctx.scene.state['messages'] = [...this.msgs];
  //   console.log(ctx.scene.state['messages']);
  //   await this.sceneCleaner(ctx);
  //   // await ctx.scene.leave();
  // }

  @On('text')
  async onMsg(
    @Message('text') msg: string,
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    ctx.deleteMessage();
    const data = ctx.scene.state['callback'];
    console.log(data);
    if (data === 'address') {
      this.address = msg;
      await this.sceneCleaner(ctx);
      await ctx.scene.reenter();
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
      this.msgs = [];
      ctx.scene.state['messages'] = [];
    }

  }
}
