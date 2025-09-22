import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina campos extra que no están en el DTO
      forbidNonWhitelisted: true, // lanza error si se envían campos no permitidos
      transform: true, // transforma tipos automáticamente (ej: string -> number)
    }),
  );

    app.enableCors({
    origin: 'http://localhost:5173', // URL de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // si usas cookies o JWT en cookies
  });

  await app.listen(3000);
}
bootstrap();
