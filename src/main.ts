import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfig, IServerConfig } from './types';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<IConfig>>(ConfigService);
  const port = configService.get<IServerConfig>('server').port;
  await app.listen(port);
  logger.log(`Notification service started on the port: ${port}`);
}
bootstrap();
