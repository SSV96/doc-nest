import * as dotenv from 'dotenv-flow';
dotenv.config({ silent: true });
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import Logger from './logger';
import { ConsoleTransport } from './logger/transports';
import _config from './config';
import { AllExceptionsFilter } from './common/filters/allexception.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('DocNest API')
    .setDescription('Comprehensive API documentation for DocNest services')
    .setVersion('1.0')
    .addTag('Auth', 'Endpoints related to authentication')
    .addTag('Users', 'Operations on user data')
    .addTag('Documents', 'Document management APIs')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost).httpAdapter),
  );

  await app.listen(cfg.app.port);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
