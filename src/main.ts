import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');

  // Add this debug log
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Server is listening on 0.0.0.0:${port}`);
}
bootstrap();
