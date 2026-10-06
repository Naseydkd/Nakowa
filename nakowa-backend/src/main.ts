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
    'http://localhost:5500',                    // Dev local
    'http://127.0.0.1:5500',                    // Dev local alternative
    'https://nakowa-three.vercel.app',          // Production frontend
    configService.get<string>('FRONTEND_URL'),  // Custom domain (from env)
    /^https:\/\/nakowa-three-.*\.vercel\.app$/, // Preview deployments frontend
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
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

  // Initialize app (required for serverless)
  await app.init();

  return app;
}

// For local development
if (require.main === module) {
  bootstrap().then(async (app) => {
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port);
    console.log(`🚀 Nakowa Backend running on: http://localhost:${port}/api`);
    console.log(`🌍 Environment: ${configService.get<string>('NODE_ENV')}`);
  });
}

// Export for serverless
module.exports = { bootstrap };
