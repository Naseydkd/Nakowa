import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { QueryServiceDto } from './dto/query-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServiceDto) {
    return this.prisma.service.create({ data });
  }

  async findAll(filters: QueryServiceDto) {
    const { search, type, isActive, page, limit, sortBy, sortOrder = 'desc' } = filters;
    const where: Prisma.ServiceWhereInput = {
      ...(type && { type }),
      ...(isActive !== undefined && { isActive }),
      ...(search && { nom: { contains: search, mode: 'insensitive' } }),
    };
    const orderBy: Prisma.ServiceOrderByWithRelationInput =
      sortBy === 'nom' ? { nom: sortOrder } : { createdAt: sortOrder };

    return this.prisma.service.findMany({
      where,
      orderBy,
      ...(page && limit && { skip: (Number(page) - 1) * Number(limit), take: Number(limit) }),
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateServiceDto) {
    return this.prisma.service.update({ where: { id }, data });
  }

  async deactivate(id: string) {
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats() {
    const total = await this.prisma.service.count();
    const active = await this.prisma.service.count({ where: { isActive: true } });
    return { total, active };
  }

  async delete(id: string) {
    return this.prisma.service.delete({ where: { id } });
  }
}
