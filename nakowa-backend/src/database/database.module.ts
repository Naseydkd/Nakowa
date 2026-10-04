import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';

@Module({
  imports: [],
  providers: [PrismaService],
  controllers: [HealthController],
  exports: [PrismaService],
})
export class DatabaseModule {}
