import * as dotenv from 'dotenv-flow';
dotenv.config({ silent: true });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Logger from './logger';
import { ConsoleTransport } from './logger/transports';
import _config from './config';
async function bootstrap() {
  const cfg = _config(process.env);
  const logger = Logger.initWinston({
    transports: [ConsoleTransport(cfg.app.appName)],
  });

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  if (!cfg.app.port) {
    throw new Error('❌ PORT is not defined in environment variables.');
  }

  app.enableCors();

  app.setGlobalPrefix('api');

  await app.listen(cfg.app.port);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
