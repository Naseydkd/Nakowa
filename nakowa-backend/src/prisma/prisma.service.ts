import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma connected to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('📤 Prisma disconnected from database');
  }

  /**
   * Enable graceful shutdown for serverless environments
   * This ensures connections are properly closed when the function terminates
   */
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  /**
   * Clean disconnected connections (useful in serverless)
   * Call this periodically in long-running processes
   */
  async cleanupIdleConnections() {
    try {
      await this.$disconnect();
      await this.$connect();
      console.log('🔄 Prisma connection pool refreshed');
    } catch (error) {
      console.error('⚠️ Error refreshing Prisma connection pool:', error);
    }
  }
}