import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('app.port');

  if (!port) {
    throw new Error('❌ PORT is not defined in environment variables.');
  }

  app.enableCors();

  app.setGlobalPrefix('api');

  await app.listen(port);
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
