import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UserIdentity } from '@modules/auth/interfaces/user-identity.interface';
import { Logger } from '@nestjs/common';


declare module 'express' {
  interface Request {
    user?: UserIdentity; // or `any` if you haven't typed it yet
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

  app.enableCors({
    origin: ['https://will-soon.com', 'https://www.will-soon.com'],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Server is listening on 0.0.0.0:${port}`);
}
bootstrap();
