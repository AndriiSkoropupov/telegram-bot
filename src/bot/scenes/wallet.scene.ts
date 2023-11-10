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
  private msgs = [];
  private mainMsg = null;
  private importMsg = null;
  private sendMsg = null;

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context): Promise<any> {
    this.sceneCleaner(ctx);
    this.mainMsg = await ctx.reply(
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
    // this.msgs.push(msg);
    // ctx.scene.state['messages'] = this.msgs;
    // console.log(ctx.scene.state);
  }

  @Action(/refresh|back/)
  async onRefresh(
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    if (this.importMsg) {
      await ctx.deleteMessage(this.importMsg.message_id);
      this.importMsg = null;
    }
    if (this.mainMsg) {
      await ctx.deleteMessage(this.mainMsg.message_id);
      this.mainMsg = null;
    }
    if (this.sendMsg) {
      await ctx.deleteMessage(this.sendMsg.message_id);
      this.sendMsg = null;
    }
    await ctx.scene.reenter();
  }

  @Hears(['🔎 Info'])
  @Command('info')
  async onInfo(@Ctx() ctx: Context): Promise<any> {
    const forDelete = [];
    await ctx.deleteMessage();
    if (this.importMsg) {
      await ctx.deleteMessage(this.importMsg.message_id);
      this.importMsg = null;
    }
    if (this.mainMsg) {
      await ctx.deleteMessage(this.mainMsg.message_id);
      this.mainMsg = null;
    }
    if (this.sendMsg) {
      await ctx.deleteMessage(this.sendMsg.message_id);
      this.sendMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
    await ctx.scene.enter(INFO_SCENE_ID);
  }

  @Command('loyalty')
  @Hears(['🎁 Loyalty'])
  async onLoyalty(@Ctx() ctx: Context): Promise<any> {
    const forDelete = [];
    await ctx.deleteMessage();
    if (this.importMsg) {
      await ctx.deleteMessage(this.importMsg.message_id);
      this.importMsg = null;
    }
    if (this.mainMsg) {
      await ctx.deleteMessage(this.mainMsg.message_id);
      this.mainMsg = null;
    }
    if (this.sendMsg) {
      await ctx.deleteMessage(this.sendMsg.message_id);
      this.sendMsg = null;
    }
    if (forDelete.length > 0) {
      ctx.scene.state['messages'] = forDelete;
      await this.sceneCleaner(ctx);
    }
    await ctx.scene.enter(LOYALTY_SCENE_ID);
  }

  @Hears(['🔁 Swap'])
  @Command('swap')
  async onSwap(@Ctx() ctx: Context): Promise<any> {
    ctx.deleteMessage();
    await this.sceneCleaner(ctx);
    await ctx.scene.enter(SWAP_SCENE_ID);
  }

  @Action(/import/)
  async onImport(@Ctx() ctx: Context & { update: Update.CallbackQueryUpdate }) {
    this.importMsg = await ctx.reply(
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
    // this.msgs.push(msg);
    // ctx.scene.state['messages'] = this.msgs;
    ctx.scene.state['callback'] =
      'data' in ctx.update.callback_query
        ? ctx.update.callback_query.data
        : null;
    console.log(ctx.scene.state['messages']);
  }

  @Action(/send/)
  async onSend(@Ctx() ctx: Context & { update: Update.CallbackQueryUpdate }) {
    if (this.importMsg) {
      await ctx.deleteMessage(this.importMsg.message_id);
      this.importMsg = null;
    }
    if (this.sendMsg) {
      await ctx.deleteMessage(this.sendMsg.message_id);
      this.sendMsg = null;
    }
    ctx.scene.state['message'] = this.mainMsg;
    await ctx.scene.enter(SEND_SCENE_ID, ctx.scene.state);
  }

  @On('text')
  async onMsg(
    @Message('text') msg: string,
    @Ctx() ctx: Context & { update: Update.CallbackQueryUpdate },
  ) {
    ctx.deleteMessage();
    const data = ctx.scene.state['callback'];
    console.log(data);
    if (data === 'import') {
      this.tokens.push(msg);
      ctx.scene.state['callback'] = '';
      await ctx.deleteMessage(this.importMsg.message_id);
      this.importMsg = null;
      await ctx.scene.reenter();
      this.sendMsg = await ctx.reply('✅ Token was imported successfully.');
      // this.msgs.push(sendMsg);
      // ctx.scene.state['messages'] = this.msgs;
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
