import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async create({ password, ...data }: CreateUserDto) {
    const passwordHash = await bcrypt.hash(password, 12);
    return this.prisma.user.create({
      data: { ...data, passwordHash },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async update(id: string, { password, ...data }: UpdateUserDto) {
    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
    return this.prisma.user.update({
      where: { id },
      data: { ...data, ...(passwordHash && { passwordHash }) },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }
}
