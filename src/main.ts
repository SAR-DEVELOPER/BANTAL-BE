import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UserIdentity } from '@modules/auth/interfaces/user-identity.interface';
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { Logger } from '@nestjs/common';


declare module 'express' {
  interface Request {
    user?: UserIdentity; // JWT token data
    identity?: Identity; // Internal identity database record
  }
}

// main.ts
async function bootstrap() {
  // Enable debug logs by setting this environment variable
  process.env.LOG_LEVEL = 'debug';

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Include all log levels
  });

  app.use(cookieParser());

  // Trust proxy (important for HTTPS behind Caddy)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);

  // CORS configuration
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [
      'https://web.centri.id',
      'https://www.web.centri.id',
      'http://localhost:3000', // For local development
    ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Server is listening on 0.0.0.0:${port}`);
  logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
