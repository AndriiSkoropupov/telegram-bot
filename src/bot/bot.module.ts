import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { WalletScene } from './scenes/wallet.scene';
import { InfoScene } from './scenes/info.scene';
import { SendScene } from './scenes/send.scene';
import { LoyaltyScene } from './scenes/loyalty.scene';
import { SwapScene } from './scenes/swap.scene';

@Module({
  providers: [
    BotUpdate,
    WalletScene,
    InfoScene,
    SendScene,
    LoyaltyScene,
    SwapScene,
  ],
})
export class BotModule {}
