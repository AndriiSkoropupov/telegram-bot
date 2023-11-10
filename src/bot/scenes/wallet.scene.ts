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
  LOYALTY_SCENE_ID,
  SEND_SCENE_ID,
  SWAP_SCENE_ID,
  WALLET_SCENE_ID,
} from '../../app.constants';
import { Context } from '../../interfaces/context.interface';
import { Update } from 'telegraf/typings/core/types/typegram';

@Scene(WALLET_SCENE_ID)
export class WalletScene {
  private tokens = ['ETH'];
  private msgs = {};

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    const chatId = ctx.chat.id;
    this.msgs[chatId] = {
      mainMsg: null,
      importMsg: null,
      sendMsg: null,
    };
    try {
      this.msgs[chatId].mainMsg = await ctx.reply(
        `
💳 My Wallet

<code>0xF68db204C370B4E463f772EA17C8dC45EA251b13</code>

🔗 Ethereum
    
${this.tokens.reduce((acc, token) => {
  acc = acc + token + ` <code>0</code>(<code>$0</code>)` + '\n';
  return acc;
}, '')}
🔹 <a href="https://etherscan.io/address/0xF68db204C370B4E463f772EA17C8dC45EA251b13">Etherscan</a>  | 🔸 <a href="https://debank.com/profile/0xF68db204C370B4E463f772EA17C8dC45EA251b13">DeBank</a> `,
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{ text: '↗️ Send', callback_data: 'send' }],
              [
                {
                  text: '➕ Import Tokens',
                  callback_data: 'import',
                },
                {
                  text: '🔄 Refresh',
                  callback_data: 'refresh',
                },
              ],
            ],
            resize_keyboard: true,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async clearAllMsg(@Ctx() ctx: Context) {
    await ctx.deleteMessage();
    const chatId = ctx.chat.id;
    const forDelete = [];
    if (this.msgs[chatId].mainMsg) {
      forDelete.push(this.msgs[chatId].mainMsg);
      this.msgs[chatId].mainMsg = null;
    }
    if (this.msgs[chatId].importMsg) {
      forDelete.push(this.msgs[chatId].importMsg);
      this.msgs[chatId].importMsg = null;
    }
    if (this.msgs[chatId].sendMsg) {
      forDelete.push(this.msgs[chatId].sendMsg);
      this.msgs[chatId].sendMsg = null;
    }

    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
  }

  async clearMsg(@Ctx() ctx: Context) {
    const chatId = ctx.callbackQuery.message.chat.id;
    if (this.msgs[chatId].mainMsg) {
      await ctx.deleteMessage(this.msgs[chatId].mainMsg.message_id);
      this.msgs[chatId].mainMsg = null;
    }
    if (this.msgs[chatId].importMsg) {
      await ctx.deleteMessage(this.msgs[chatId].importMsg.message_id);
      this.msgs[chatId].importMsg = null;
    }
    if (this.msgs[chatId].sendMsg) {
      await ctx.deleteMessage(this.msgs[chatId].sendMsg.message_id);
      this.msgs[chatId].sendMsg = null;
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

  @Hears(['🔁 Swap'])
  @Command('swap')
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.enter(SWAP_SCENE_ID);
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/refresh|back/)
  async onRefresh(
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    await this.clearAllMsg(ctx);
    try {
      await ctx.scene.reenter();
    } catch (error) {
      console.log(error);
    }
  }

  @Action(/import/)
  async onImport(@Ctx() ctx: Context & { update: Update.CallbackQueryUpdate }) {
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      this.msgs[chatId].importMsg = await ctx.reply(
        `
👀 Import Tokens

Add the tokens you've sent to this address.

Enter token address in text message here:
`,
        {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            force_reply: true,
            input_field_placeholder: 'token address',
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]],
            resize_keyboard: true,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
    ctx.scene.state['callback'] =
      'data' in ctx.update.callback_query
        ? ctx.update.callback_query.data
        : null;
    console.log(ctx.scene.state['messages']);
  }

  @Action(/send/)
  async onSend(@Ctx() ctx: Context & { update: Update.CallbackQueryUpdate }) {
    const chatId = ctx.callbackQuery.message.chat.id;
    try {
      if (this.msgs[chatId].importMsg) {
        await ctx.deleteMessage(this.msgs[chatId].message_id);
        this.msgs[chatId].importMsg = null;
      }
      if (this.msgs[chatId].sendMsg) {
        await ctx.deleteMessage(this.msgs[chatId].sendMsg.message_id);
        this.msgs[chatId].sendMsg = null;
      }
      ctx.scene.state['message'] = this.msgs[chatId].mainMsg;
      await ctx.scene.enter(SEND_SCENE_ID, ctx.scene.state);
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
    const data = ctx.scene.state['callback'];
    if (data === 'import') {
      try {
        this.tokens.push(msg);
        ctx.scene.state['callback'] = '';
        await ctx.deleteMessage(this.msgs[chatId].importMsg.message_id);
        this.msgs[chatId].importMsg = null;
        await ctx.scene.reenter();
        this.msgs[chatId].sendMsg = await ctx.reply(
          '✅ Token was imported successfully.',
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  async sceneCleaner(@Ctx() ctx: Context) {
    if (ctx.scene.state['messages']) {
      for (const { message_id: id } of ctx.scene.state['messages']) {
        try {
          console.log(id);
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
