import { LogLevel } from '@nestjs/common';

export interface IServerConfig {
  protocol: string;
  host: string;
  port: number;
}

export interface IConfig {
  log: {
    level: LogLevel;
  };
  server: IServerConfig;
  tg: {
    token: string;
  };
}
