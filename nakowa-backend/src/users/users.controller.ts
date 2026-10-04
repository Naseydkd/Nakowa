import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Body } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UpdateUserDto) {
    return this.usersService.update(id, data);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
