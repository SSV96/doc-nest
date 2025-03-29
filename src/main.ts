import * as dotenv from 'dotenv-flow';
dotenv.config({ silent: true });
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Logger from './logger';
import { ConsoleTransport } from './logger/transports';
import _config from './config';
import { AllExceptionsFilter } from './common/filters/allexception.filter';
import { ZodValidationPipe } from 'nestjs-zod';
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
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost).httpAdapter),
  );
  app.setGlobalPrefix('api');

  await app.listen(cfg.app.port);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
