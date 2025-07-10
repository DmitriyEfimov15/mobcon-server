import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true,  
  });

  app.use(cookieParser())
  await app.listen(PORT, () => console.log(`Server is running on PORT=${PORT}`));
}
bootstrap();
