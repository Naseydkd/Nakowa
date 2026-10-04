import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ServicesModule } from './services/services.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CollectionsModule } from './collections/collections.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { DatabaseModule } from './database/database.module';
import { ZonesModule } from './zones/zones.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ClientsModule,
    ServicesModule,
    PaymentsModule,
    DashboardModule,
    PrismaModule,
    SubscriptionsModule,
    CollectionsModule,
    ActivityLogsModule,
    DatabaseModule,
    ZonesModule,
  ],
})
export class AppModule {}
