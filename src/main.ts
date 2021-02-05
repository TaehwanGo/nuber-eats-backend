import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtMiddleware } from './jwt/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // app.use(new JwtMiddleware()); // app.use() requires a middleware function // class는 안됨
  app.enableCors();
  await app.listen(4000);
}
bootstrap();
