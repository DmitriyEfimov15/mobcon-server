import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true,  
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  app.use(cookieParser())
  await app.listen(PORT, () => console.log(`Server is running on PORT=${PORT}`));
}
bootstrap();
