import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AuthModule } from '../auth/auth.module';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentsService } from '../payments/payments.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [AuthModule, PaymentsModule],
  controllers: [ClientsController],
  providers: [ClientsService, PaymentsService, PrismaService],
  exports: [ClientsService],
})
export class ClientsModule {}
