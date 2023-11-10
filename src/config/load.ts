import { LogLevel } from '@nestjs/common';
import { IConfig } from '../types';
import * as process from 'process';

export const loadEnv = (): IConfig => {
  return {
    log: {
      level: process.env.LOG_LEVEL as LogLevel,
    },
    server: {
      protocol: process.env.SERVER_PROTOCOL,
      host: process.env.SERVER_HOST,
      port: Number(process.env.SERVER_PORT),
    },
    tg: {
      token: process.env.TG_BOT_TOKEN,
    },
  };
};

export const loadAll = async () => {
  return loadEnv();
};
