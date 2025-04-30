import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { UserIdentity } from '@modules/auth/interfaces/user-identity.interface';


declare module 'express' {
  interface Request {
    user?: UserIdentity; // or `any` if you haven't typed it yet
  }
}

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); 

  app.enableCors({
    origin: ['https://will-soon.com', 'https://www.will-soon.com'],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');

  // Add this debug log
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Server is listening on 0.0.0.0:${port}`);
}
bootstrap();
