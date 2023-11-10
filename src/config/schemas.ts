import * as Joi from 'joi';

export const envValidationSchema = () => {
  return Joi.object({
    // MODE
    LOG_LEVEL: Joi.string()
      .valid('error', 'warn', 'info', 'verbose', 'debug', 'silly')
      .default('info'),
    // SERVER
    SERVER_PROTOCOL: Joi.string().default('http'),
    SERVER_HOST: Joi.string().default('localhost'),
    SERVER_PORT: Joi.string().default('8080'),
    // TG
    TG_BOT_TOKEN: Joi.string().required(),
  });
};
