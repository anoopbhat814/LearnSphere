import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: process.env.WEB_ORIGIN ?? true } });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.warn(`LearnSphere API listening on :${port}`);
}

bootstrap();
