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
const frontendUrl = configService.get<string>('FRONTEND_URL');

app.enableCors({
  origin: frontendUrl || 'http://localhost:5500',
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
}
bootstrap();
