import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());

  // CORS
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5500';
  const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
  app.enableCors({
    origin: (origin, callback) => {
      const isLocalDevServer = Boolean(origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));
      if (!origin || origin === frontendUrl || (isDevelopment && isLocalDevServer)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origine CORS non autorisée : ${origin}`));
    },
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Nakowa API running on: http://localhost:${port}/api`);
}
bootstrap();
