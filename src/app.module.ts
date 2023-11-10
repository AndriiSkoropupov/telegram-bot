import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { BotModule } from './bot/bot.module';
import { sessionMiddleware } from './middleware/session.middleware';

@Module({
  imports: [
    AppConfigModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const tg = configService.get<{ token: string }>('tg');
        return {
          include: [BotModule],
          middlewares: [sessionMiddleware],
          token: tg.token,
        };
      },
    }),
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
