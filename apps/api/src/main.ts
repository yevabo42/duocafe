import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import pino from 'pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { bufferLogs: true },
  );

  // Prefijo global
  app.setGlobalPrefix('api/v1');

  // Seguridad
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  });

  // Validacion global con zod-style class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtro global de errores HTTP
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');

  logger.info({ port, env: process.env.NODE_ENV }, 'DuoCafé API started');
}

bootstrap().catch((err) => {
  logger.error(err, 'Failed to start application');
  process.exit(1);
});
