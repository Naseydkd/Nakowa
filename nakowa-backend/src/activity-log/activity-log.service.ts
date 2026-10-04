import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ActivityLogData {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: ActivityLogData): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entity,
          entityId: data.entityId,
          description: data.details,
        },
      });
    } catch (error) {
      // Log error but don't throw to avoid breaking main operations
      console.error('Failed to log activity:', error);
    }
  }

  async getActivities(options: {
    userId?: string;
    entity?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const { userId, entity, entityId, limit = 50, offset = 0 } = options;

    const where: any = {};

    if (userId) where.userId = userId;
    if (entity) where.entityType = entity;
    if (entityId) where.entityId = entityId;

    return this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}