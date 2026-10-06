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

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS - Multi-origin support (dev + production)
  const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://nakowa-three.vercel.app',
    'https://nakowa-frontend.vercel.app',
    'https://nakowa.site',
    'https://www.nakowa.site',
    configService.get<string>('FRONTEND_URL'),
    /^https:\/\/nakowa-three-.*\.vercel\.app$/,
    /^https:\/\/nakowa-frontend-.*\.vercel\.app$/,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(allowed => 
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      )) {
        callback(null, true);
      } else {
        console.warn(`CORS: Origin ${origin} not allowed`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-cron-secret'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Start server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Nakowa Backend running on port ${port}`);
  console.log(`🌍 Environment: ${configService.get<string>('NODE_ENV')}`);
}

bootstrap();
